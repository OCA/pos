/* Copyright 2018 Tecnativa - Jairo Llopis
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define("pos_pricelist.models", function (require) {
    "use strict";

    var core = require("web.core");
    var models = require("point_of_sale.models");
    var utils = require('web.utils');

    var moment = window.moment;
    var round_pr = utils.round_precision;

    var exports = {};

    // Patch PosModel (it's a Backbone.Model, not a usual odoo model)
    var _PosModel_initialize = models.PosModel.prototype.initialize;
    models.PosModel.prototype.initialize = function () {
        _PosModel_initialize.apply(this, arguments);
        this.default_pricelist = null;
    };

    // Patch res.partner
    models.load_fields("res.partner", ["property_product_pricelist"]);

    // Patch product.pricelist
    models.load_fields("product.pricelist", ['name', 'display_name']);
    var _product_pricelist = _.findWhere(
            models.PosModel.prototype.models,
            {model: "product.pricelist"}
        ),
        _product_pricelist_domain = _product_pricelist.domain,
        _product_pricelist_loaded = _product_pricelist.loaded;
    delete _product_pricelist.ids;
    _product_pricelist.domain = function (self) {
        return _.union(
            _product_pricelist_domain,
            [['id', 'in', self.config.available_pricelist_ids]]
        );
    };
    _product_pricelist.loaded = function (self, pricelists) {
        _product_pricelist_loaded.apply(this, arguments);
        _.map(pricelists, function (pricelist) {
            pricelist.items = [];
        });
        self.default_pricelist = _.findWhere(
            pricelists,
            {id: self.config.pricelist_id[0]}
        );
        self.pricelists = pricelists;
        self.pricelist = self.default_pricelist;
    };

    // New models to load after product.pricelist
    models.load_models(
        [
            {
                model: 'product.pricelist.item',
                domain: function(self) {
                    return [['pricelist_id', 'in',
                             _.pluck(self.pricelists, 'id')]];
                },
                loaded: function(self, pricelist_items){
                    var pricelist_by_id = {};
                    _.each(self.pricelists, function (pricelist) {
                        pricelist_by_id[pricelist.id] = pricelist;
                    });

                    _.each(pricelist_items, function (item) {
                        var pricelist = pricelist_by_id[item.pricelist_id[0]];
                        pricelist.items.push(item);
                        item.base_pricelist = pricelist_by_id[
                            item.base_pricelist_id[0]
                        ];
                    });
                },
            }, {
                model: 'product.category',
                fields: ['name', 'parent_id'],
                loaded: function (self, product_categories) {
                    var category_by_id = {};
                    _.each(product_categories, function (category) {
                        category_by_id[category.id] = category;
                    });
                    _.each(product_categories, function (category) {
                        category.parent = category_by_id[
                            category.parent_id[0]
                        ];
                    });
                    self.product_categories = product_categories;
                }
            },
        ], {
            after: "product.pricelist",
        }
    );

    // Patch product.product
    models.load_fields(
        "product.product",
        ['lst_price', 'standard_price', 'categ_id']
    );
    var _product_product = _.findWhere(
            models.PosModel.prototype.models,
            {model: "product.product"}
        );
    _product_product.loaded = function (self, products) {
        self.db.add_products(_.map(products, function (product) {
            product.categ = _.findWhere(
                self.product_categories,
                {'id': product.categ_id[0]}
            );
            return new exports.Product(product);
        }));
    };

    // New model Product
    exports.Product = core.Class.extend({
        init: function(options) {
            _.extend(this, options);
        },

        // Port of get_product_price on product.pricelist.
        //
        // Anything related to UOM can be ignored, the POS will always use
        // the default UOM set on the product and the user cannot change
        // it.
        //
        // Pricelist items do not have to be sorted. All
        // product.pricelist.item records are loaded with a search_read
        // and were automatically sorted based on their _order by the
        // ORM. After that they are added in this order to the pricelists.
        get_price: function(pricelist, quantity) {
            var self = this;
            var date = moment().startOf('day');

            var category_ids = [];
            var category = this.categ;
            while (category) {
                category_ids.push(category.id);
                category = category.parent;
            }

            var pricelist_items = _.filter(pricelist.items, function (item) {
                return (! item.product_tmpl_id || item.product_tmpl_id[0] === self.product_tmpl_id) &&
                        (! item.product_id || item.product_id[0] === self.id) &&
                        (! item.categ_id || _.contains(category_ids, item.categ_id[0])) &&
                        (! item.date_start || moment(item.date_start) <= date) &&
                        (! item.date_end || moment(item.date_end) >= date);
            });

            var price = self.lst_price;
            _.find(pricelist_items, function (rule) {
                if (rule.min_quantity && quantity < rule.min_quantity) {
                    return false;
                }

                if (rule.base === 'pricelist') {
                    price = self.get_price(rule.base_pricelist, quantity);
                } else if (rule.base === 'standard_price') {
                    price = self.standard_price;
                }

                if (rule.compute_price === 'fixed') {
                    price = rule.fixed_price;
                    return true;
                } else if (rule.compute_price === 'percentage') {
                    price -= price * (rule.percent_price / 100);
                    return true;
                }
                var price_limit = price;
                price -= price * (rule.price_discount / 100);
                if (rule.price_round) {
                    price = round_pr(price, rule.price_round);
                }
                if (rule.price_surcharge) {
                    price += rule.price_surcharge;
                }
                if (rule.price_min_margin) {
                    price = Math.max(
                        price,
                        price_limit + rule.price_min_margin
                    );
                }
                if (rule.price_max_margin) {
                    price = Math.min(
                        price,
                        price_limit + rule.price_max_margin
                    );
                }
                return true;
            });

            // This return value has to be rounded with round_di before
            // being used further. Note that this cannot happen here,
            // because it would cause inconsistencies with the backend for
            // pricelist that have base == 'pricelist'.
            return price;
        },
    });

    // Patch Orderline
    var _Orderline_initialize = models.Orderline.prototype.initialize,
        _Orderline_init_from_JSON = models.Orderline.prototype.init_from_JSON,
        _Orderline_set_quantity = models.Orderline.prototype.set_quantity;
    models.Orderline.prototype.initialize = function (attr, options) {
        _Orderline_initialize.apply(this, arguments);
        if (options.product) {
            this.set_unit_price(
                options.product.price ||
                this.product.get_price(
                    this.order.pricelist,
                    this.get_quantity()
                )
            );
        }
    };
    models.Orderline.prototype.init_from_JSON = function () {
        this.keep_price = 'do not recompute unit price';
        return _Orderline_init_from_JSON.apply(this, arguments);
    };
    models.Orderline.prototype.set_quantity = function () {
        _Orderline_set_quantity.apply(this, arguments);
        var keep_price = this.keep_price;
        delete this.keep_price;
        // just like in sale.order changing the quantity will recompute the unit price
        if (!keep_price) {
            this.set_unit_price(this.product.get_price(
                this.order.pricelist,
                this.get_quantity()
            ));
            this.order.fix_tax_included_price(this);
        }
    };

    // Patch Order
    var _Order_initialize = models.Order.prototype.initialize,
        _Order_init_from_JSON = models.Order.prototype.init_from_JSON,
        _Order_export_as_JSON = models.Order.prototype.export_as_JSON;
    models.Order.prototype.initialize = function () {
        _Order_initialize.apply(this, arguments);
        this.set_pricelist(this.pos.default_pricelist);
    };
    models.Order.prototype.init_from_JSON = function (json) {
        _Order_init_from_JSON.apply(this, arguments);
        if (json.pricelist_id) {
            this.pricelist = _.find(this.pos.pricelists, function (pricelist) {
                return pricelist.id === json.pricelist_id;
            });
        } else {
            this.pricelist = this.pos.default_pricelist;
        }
    };
    models.Order.prototype.export_as_JSON = function () {
        var result = _Order_export_as_JSON.apply(this, arguments);
        result.pricelist_id = this.pricelist ? this.pricelist.id : false;
        return result;
    };
    models.Order.prototype.set_pricelist = function (pricelist) {
        var self = this;
        this.pricelist = pricelist;
        _.each(this.get_orderlines(), function (line) {
            line.set_unit_price(
                line.product.get_price(self.pricelist, line.get_quantity())
            );
            self.fix_tax_included_price(line);
        });
        this.trigger('change');
    };

    return exports;
});
