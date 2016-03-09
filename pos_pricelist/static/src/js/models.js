/******************************************************************************
 *    Point Of Sale - Pricelist for POS Odoo
 *    Copyright (C) 2014 Taktik (http://www.taktik.be)
 *    @author Adil Houmadi <ah@taktik.be>
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License as
 *    published by the Free Software Foundation, either version 3 of the
 *    License, or (at your option) any later version.
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 ******************************************************************************/
odoo.define('pos_pricelist.models', function (require) {
	"use strict";

	var PosDB = require('point_of_sale.DB');
	var models = require('point_of_sale.models');
	var screens = require('pos_pricelist.widgets');
	var core = require('web.core');
	var gui = require('point_of_sale.gui');

	var _t = models._t;
    var round_pr = models.round_precision;
    var round_di = models.round_decimals;

	PosDB = PosDB.extend({
	    init: function (options) {
	        options = options || {};
	        this._super(options);
	        this.pricelist_by_id = {};
	        this.pricelist_version_by_id = {};
	        this.pricelist_item_by_id = {};
	        this.pricelist_item_sorted = [];
	        this.product_category_by_id = {};
	        this.product_category_children = {};
	        this.product_category_ancestors = {};
	        this.product_price_type_by_id = {};
	        this.supplierinfo_by_id = {};
	        this.pricelist_partnerinfo_by_id = {};
	        this.fiscal_position_tax_by_id = {};
	    },
	    add_fiscal_position_taxes: function (fiscal_position_taxes) {
	        if (!(fiscal_position_taxes instanceof Array)) {
	            fiscal_position_taxes = [fiscal_position_taxes];
	        }
	        var fiscal_position_tax;
	        while (fiscal_position_tax = fiscal_position_taxes.pop()) {
	            this.fiscal_position_tax_by_id[fiscal_position_tax.id]
	                = fiscal_position_tax;
	        }
	    },
        add_pricelist_partnerinfo: function (pricelist_partnerinfos) {
            if (!(pricelist_partnerinfos instanceof Array)) {
                pricelist_partnerinfos = [pricelist_partnerinfos];
            }
            var partner_info;
            while (partner_info = pricelist_partnerinfos.pop()) {
                this.pricelist_partnerinfo_by_id[partner_info.id]
                    = partner_info;
            }
        },
		add_supplierinfo: function (supplierinfos) {
	        if (!(supplierinfos instanceof Array)) {
	            supplierinfos = [supplierinfos];
	        }
	        var supplier_info;
	        while (supplier_info = supplierinfos.pop()) {
	            this.supplierinfo_by_id[supplier_info.id] = supplier_info;
	        }
	    },
	    add_pricelists: function (pricelists) {
	        if (!(pricelists instanceof Array)) {
	            pricelists = [pricelists];
	        }
	        var pricelist;
	        while (pricelist = pricelists.pop()) {
	            this.pricelist_by_id[pricelist.id] = pricelist;
	        }
	    },
        add_pricelist_versions: function (versions) {
            if (!(versions instanceof Array)) {
                versions = [versions];
            }
            var version;
            while (version = versions.pop()) {
                this.pricelist_version_by_id[version.id] = version;
            }
        },
	    add_pricelist_items: function (items) {
	        if (!(items instanceof Array)) {
	            items = [items];
	        }
	        var item;
	        while (item = items.pop()) {
	            this.pricelist_item_by_id[item.id] = item;
	        }
	        this.pricelist_item_sorted = this._items_sorted();
	    },
		add_price_types: function (price_types) {
            if (!(price_types instanceof Array)) {
                price_types = [price_types];
            }
            var ptype;
            while (ptype = price_types.pop()) {
                this.product_price_type_by_id[ptype.id] = ptype;
            }
        },
	    add_product_categories: function (categories) {
	        if (!(categories instanceof Array)) {
	            categories = [categories];
	        }
	        var category;
	        while (category = categories.pop()) {
	            this.product_category_by_id[category.id] = category;
	            this.product_category_children[category.id] =
	                category.child_id;
	        }
	        this._make_ancestors();
	    },
	    _make_ancestors: function () {
	        var category, ancestors;
	        for (var id in this.product_category_by_id) {
	            category = this.product_category_by_id[id];
	            ancestors = [];
	            while (category.parent_id) {
	                ancestors.push(category.parent_id[0]);
	                category = category.parent_id ?
	                    this.product_category_by_id[category.parent_id[0]] :
	                    false;
	            }
	            this.product_category_ancestors[parseInt(id)] = ancestors;
	        }
	    },
	    _items_sorted: function () {
	        var items = this.pricelist_item_by_id;
	        var list = [];
	        for (var key in items) {
	            list.push(items[key]);
	        }
	        list.sort(function (a, b) {
	            if (a.sequence < b.sequence) return -1;
	            if (a.sequence > b.sequence) return 1;
	            if (a.min_quantity > b.min_quantity) return -1;
	            if (a.min_quantity < b.min_quantity) return 1;
	            return 0;
	        });
	        return list;
	    },
	    map_tax: function (fiscal_position_id, taxes_ids) {
	        var taxes = [];
	        var found_taxes = {};
	        for (var id in this.fiscal_position_tax_by_id) {
	            var fp_line = this.fiscal_position_tax_by_id[id];
	            if (fp_line && fp_line.position_id &&
	                    fp_line.position_id[0] == fiscal_position_id &&
	                    taxes_ids.indexOf(fp_line.tax_src_id[0]) > -1) {
	                taxes.push(fp_line.tax_dest_id[0]);
	                found_taxes[fp_line.tax_src_id[0]] = true;
	            }
	        }
	        for (var i = 0, len = taxes_ids.length; i < len; i++) {
	            var tax_id = taxes_ids[i];
	            if (!(tax_id in found_taxes)) {
	                taxes.push(tax_id);
	            }
	        }
	        return taxes;
	    },
	    add_products: function (products) {
	        this._super(products);
            //console.log('posmodel:', posmodel);
            //console.log('screens:', screens);
            //console.log('this:', this);

	        var pos = posmodel.pricelist_engine.pos;
		    var order = new models.Order({}, {pos: pos});
            //console.log('pos:', pos);
            //console.log('order:', order);
	        for (var id in this.product_by_id) {
	            if (this.product_by_id.hasOwnProperty(id)) {
	                var product = this.product_by_id[id];
	                var orderline = new models.Orderline({}, {
	                    pos: pos,
	                    order: order,
	                    product: product,
	                    price: product.price
	                });
	                var prices = orderline.get_all_prices();
	                this.product_by_id[id].price_with_taxes
	                    = prices['priceWithTax'];
		            order.destroy({'reason': 'abandon'});
	            }
	        }
	    },
	    find_product_rules: function (product) {
	        var len = this.pricelist_item_sorted.length;
	        var rules = [];
	        for (var i = 0; i < len; i++) {
	            var rule = this.pricelist_item_sorted[i];
	            if ((rule.product_id && rule.product_id[0] == product.id) ||
	                (rule.categ_id && product.categ_id
	                && rule.categ_id[0] == product.categ_id[0])) {
	                rules.push(rule);
	            }
	        }
	        return rules;
	    }
	});

	/**
     * Extend the POS model
     */
    var _super_posmodel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        /**
         * @param session
         * @param attributes
         */
        initialize: function (session, attributes) {
            _super_posmodel.initialize.apply(this, arguments);
	        this.db = new PosDB();
	        this.pos_widget = screens;
            this.pricelist_engine = new models.PricelistEngine({
                'pos': this,
                'db': this.db,
                'pos_widget': this.pos_widget
            });
            arrange_elements(this);
        },
        /**
         * find model based on name
         * @param model_name
         * @returns {{}}
         */
        find_model: function (model_name) {
            var self = this;
            var lookup = {};
            for (var i = 0, len = self.models.length; i < len; i++) {
                if (self.models[i].model === model_name) {
                    lookup[i] = self.models[i]
                }
            }
            return lookup
        },
        /**
         * @param removed_order
         * @param index
         * @param reason
         */
        on_removed_order: function (removed_order, index, reason) {
            _super_posmodel.on_removed_order.apply(this, arguments);
            if ((reason === 'abandon' || removed_order.temporary)
                && this.get('orders').size() > 0) {
                var current_order = (this.get('orders').at(index)
                || this.get('orders').last());
                var partner = current_order.get_client() ?
                    current_order.get_client() :
                    false;
                this.pricelist_engine.update_products_ui(partner);
            }
        }
    });


	/**
     * Extend the order
     */
    models.Order = models.Order.extend({
        /**
         * override this method to merge lines
         * TODO : Need some refactoring in the standard POS to Do it better
         * TODO : from line 73 till 85, we need to move this to another method
         * @param product
         * @param options
         */
        addProduct: function (product, options) {
            options = options || {};
            var attr = JSON.parse(JSON.stringify(product));
            attr.pos = this.pos;
            attr.order = this;
            var line = new openerp.point_of_sale.Orderline({}, {
                pos: this.pos,
                order: this,
                product: product
            });
            var self = this;
            var found = false;

            if (options.quantity !== undefined) {
                line.set_quantity(options.quantity);
            }
            if (options.price !== undefined) {
                line.set_unit_price(options.price);
            }
            if (options.discount !== undefined) {
                line.set_discount(options.discount);
            }

            var orderlines = [];
            if (self.get('orderLines').models !== undefined) {
                orderlines = self.get('orderLines').models;
            }
            for (var i = 0; i < orderlines.length; i++) {
                var _line = orderlines[i];
                if (_line && _line.can_be_merged_with(line) &&
                    options.merge !== false) {
                    _line.merge(line);
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.get('orderLines').add(line);
            }
            this.selectLine(this.getLastOrderline());
        }
    });

    /**
     * Extend the Order line
     */
    var _super_orderline = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        /**
         * @param attr
         * @param options
         */
        initialize: function (attr, options) {
            _super_orderline.initialize.apply(this, arguments);
            this.manual_price = false;
            if (this.product !== undefined) {
                var qty = this.compute_qty(this.order, this.product);
                var partner = this.order ? this.order.get_client() : null;
                var product = this.product;
                var db = this.pos.db;
                var price = this.pos.pricelist_engine.compute_price_all(
                    db, product, partner, qty
                );
                if (price !== false) {
                    this.price = price;
                }
            }
        },
        /**
         * @param state
         */
        set_manual_price: function (state) {
            this.manual_price = state;
        },
        /**
         * @param quantity
         */
        set_quantity: function (quantity) {
            var partner = this.order ? this.order.get_client() : null;
            var product = this.product;
            var db = this.pos.db;
            var old_price = 0;
            if (this.get_quantity()) {
                old_price = this.pos.pricelist_engine.compute_price_all(
                    db, product, partner, this.get_quantity()
                );
            }
            _super_orderline.set_quantity.apply(this, arguments);
            var price = this.pos.pricelist_engine.compute_price_all(
                db, product, partner, quantity
            );
            /* Update the price if the unit price is actually different from
               the unit price of the previous quantity, to preserve manually
               entered prices as much as possible. */
            if (price !== false && price !== old_price) {
                this.price = price;
                this.trigger('change', this);
            }
        },
        /**
         * override this method to take fiscal positions in consideration
         * get all price
         * TODO : find a better way to do it : need some refactoring
         * in the pos standard
         * @returns {{
         *  priceWithTax: *, priceWithoutTax: *, tax: number, taxDetails: {}
         *  }}
         */
        get_all_prices: function () {
            var base = this.get_base_price();
            var totalTax = base;
            var totalNoTax = base;
            var taxtotal = 0;
            var taxdetail = {};
            var product_taxes = this.get_applicable_taxes_for_orderline();
            var all_taxes = _(this.compute_all(product_taxes, base)).flatten();
            _(all_taxes).each(function (tax) {
                if (tax.price_include) {
                    totalNoTax -= tax.amount;
                } else {
                    totalTax += tax.amount;
                }
                taxtotal += tax.amount;
                taxdetail[tax.id] = tax.amount;
            });
            totalNoTax = round_pr(totalNoTax, this.pos.currency.rounding);
            return {
                "priceWithTax": totalTax,
                "priceWithoutTax": totalNoTax,
                "tax": taxtotal,
                "taxDetails": taxdetail
            };
        },
        /**
         * Override this method to avoid a return false
         * if the price is different
         * Check super method : (this.price !== orderline.price)
         * is not necessary in our case
         * @param orderline
         * @returns {boolean}
         */
        can_be_merged_with: function (orderline) {
            var result = _super_orderline.can_be_merged_with.apply(
                this, arguments
            );
            if (!result) {
                if (!this.manual_price) {
                    return (
                        this.get_product().id === orderline.get_product().id
                    );
                } else {
                    return false;
                }
            }
            return true;
        },
        /**
         * Override to set price
         * @param orderline
         */
        merge: function (orderline) {
            _super_orderline.merge.apply(this, arguments);
            this.set_unit_price(orderline.price);
        },
        /**
         * @param order
         * @param product
         * @returns {number}
         */
        compute_qty: function (order, product) {
            var qty = 1;
            var orderlines = [];
            if (order && order.get('orderLines').models !== undefined) {
                orderlines = order.get('orderLines').models;
            }
            for (var i = 0; i < orderlines.length; i++) {
                if (orderlines[i].product.id === product.id
                    && !orderlines[i].manual_price) {
                    qty += orderlines[i].quantity;
                }
            }
            return qty;
        },
        /**
         * @returns {Array}
         */
        get_applicable_taxes_for_orderline: function () {
            // find applicable taxes for this product and this customer
            var product = this.get_product();
            var product_tax_ids = product.taxes_id;
            var product_taxes = [];
            var taxes = this.pos.taxes;
            var partner = this.order ? this.order.get_client() : null;
            if (partner && partner.property_account_position) {
            	product_tax_ids =
                    this.pos.db.map_tax(
                        partner.property_account_position[0], product_tax_ids
                    );
            }
            for (var i = 0, ilen = product_tax_ids.length;
                 i < ilen; i++) {
                var tax_id = product_tax_ids[i];
                var tax = _.detect(taxes, function (t) {
                    return t.id === tax_id;
                });
                product_taxes.push(tax);
            }
            return product_taxes;
        },
        get_display_unit_price: function(){
            var rounding = this.pos.currency.rounding;
            if (this.pos.config.display_price_with_taxes) {
                return round_pr(this.get_price_with_tax() / this.get_quantity(), rounding);
            } else {
                return round_pr(this.get_base_price() / this.get_quantity(), rounding);
            }
        },
        /**
         * @returns {*}
         */
        get_display_price: function () {
            if (this.pos.config.display_price_with_taxes) {
                return this.get_price_with_tax();
            }
            return _super_orderline.get_display_price.apply(
                this, arguments
            );
        },

        export_as_JSON: function() {
            var res = _super_orderline.export_as_JSON.apply(this, arguments);
            var product_tax_ids = this.get_product().taxes_id || [];
            var partner = this.order ? this.order.get_client() : null;
            if (partner && partner.property_account_position) {
            	product_tax_ids =
                    this.pos.db.map_tax(
                        partner.property_account_position[0], product_tax_ids
                    );
            }
            res["tax_ids"] = [[6, false, product_tax_ids]];
            return res;
        }
    });

    /**
     * Pricelist Engine to compute price
     */
    models.PricelistEngine = core.Class.extend({
        /**
         * @param options
         */
        init: function (options) {
            options = options || {};
            this.pos = options.pos;
            this.db = options.db;
            this.pos_widget = options.pos_widget;
        },
        /**
         * compute price for all price list
         * @param db
         * @param product
         * @param partner
         * @param qty
         * @returns {*}
         */
        compute_price_all: function (db, product, partner, qty) {
            var price_list_id = false;
            if (partner && partner.property_product_pricelist) {
                price_list_id = partner.property_product_pricelist[0];
            } else {
                price_list_id = this.pos.config.pricelist_id[0];
            }
            return this.compute_price(
                db, product, partner, qty, parseInt(price_list_id)
            );
        },
        /**
         * loop find a valid version for the price list id given in param
         * @param db
         * @param pricelist_id
         * @returns {boolean}
         */
        find_valid_pricelist_version: function (db, pricelist_id) {
            var date = new Date();
            var version = false;
            var pricelist = db.pricelist_by_id[pricelist_id];
            for (var i = 0, len = pricelist.version_id.length; i < len; i++) {
                var v = db.pricelist_version_by_id[pricelist.version_id[i]];
                if (((v.date_start == false)
                    || (new Date(v.date_start) <= date)) &&
                    ((v.date_end == false)
                    || (new Date(v.date_end) >= date))) {
                    version = v;
                    break;
                }
            }
            return version;
        },
        /**
         * compute the price for the given product
         * @param database
         * @param product
         * @param partner
         * @param qty
         * @param pricelist_id
         * @returns {boolean}
         */
        compute_price: function (database, product, partner, qty, pricelist_id) {

            var self = this;
            var db = database;

            // get a valid version
            //var version = this.find_valid_pricelist_version(db, pricelist_id);
            //if (version == false) {
            //    var message = _t('Pricelist Error');
            //    var comment = _t('At least one pricelist has no active ' +
            //        'version ! Please create or activate one.');
            //    show_error(this, message, comment);
            //    return false;
            //}

            // get categories
            var categ_ids = [];
            if (product.categ_id) {
                categ_ids.push(product.categ_id[0]);
                categ_ids = categ_ids.concat(
                    db.product_category_ancestors[product.categ_id[0]]
                );
            }

            // find items
            var items = [], i, len;
            for (i = 0, len = db.pricelist_item_sorted.length; i < len; i++) {
                var item = db.pricelist_item_sorted[i];
                if ((item.product_id === false
                    || item.product_id[0] === product.id) &&
                    (item.categ_id === false
                    || categ_ids.indexOf(item.categ_id[0]) !== -1)
	                //&& (item.price_version_id[0] === version.id)
                ) {
                    items.push(item);
                }
            }

            var results = {};
            results[product.id] = 0.0;
            var price_types = {};
            var price = false;

            // loop through items
            for (i = 0, len = items.length; i < len; i++) {
                var rule = items[i];

                if (rule.min_quantity && qty < rule.min_quantity) {
                    continue;
                }
                if (rule.product_id && rule.product_id[0]
                    && product.id != rule.product_id[0]) {
                    continue;
                }
                if (rule.categ_id) {
                    var cat_id = product.categ_id[0];
                    while (cat_id) {
                        if (cat_id == rule.categ_id[0]) {
                            break;
                        }
                        cat_id = db.product_category_by_id[cat_id].parent_id[0]
                    }
                    if (!(cat_id)) {
                        continue;
                    }
                }
                // Based on field
                switch (rule.base) {
                    case -1:
                        if (rule.base_pricelist_id) {
                            price = self.compute_price(
                                db, product, false, qty,
                                rule.base_pricelist_id[0]
                            );
                        }
                        break;
                    case -2:
                        var seller = false;
                        for (var index in product.seller_ids) {
                            var seller_id = product.seller_ids[index];
                            var _tmp_seller = db.supplierinfo_by_id[seller_id];
                            if ((!partner) || (_tmp_seller.name.length
                                && _tmp_seller.name[0] != partner.name))
                                continue;
                            seller = _tmp_seller
                        }
                        if (!seller && product.seller_ids) {
                            seller =
                                db.supplierinfo_by_id[product.seller_ids[0]];
                        }
                        if (seller) {
                            for (var _id in seller.pricelist_ids) {
                                var info_id = seller.pricelist_ids[_id];
                                var line =
                                    db.pricelist_partnerinfo_by_id[info_id];
                                if (line.min_quantity <= qty) {
                                    price = line.price
                                }
                            }
                        }
                        break;
                    default:
                        if (!price_types.hasOwnProperty(rule.base)) {
                            price_types[rule.base] =
                                db.product_price_type_by_id[rule.base];
                        }
                        var price_type = price_types[rule.base];
                        //if (db.product_by_id[product.id]
                        //        .hasOwnProperty(price_type.field)) {
                        //    price =
                        //        db.product_by_id[product.id][price_type.field];
                        //}
                }
                if (price !== false) {
                    var price_limit = price;
                    price = price * (1.0 + (rule['price_discount']
                            ? rule['price_discount']
                            : 0.0));
                    if (rule['price_round']) {
                        price = parseFloat(price.toFixed(
                                Math.ceil(Math.log(1.0 / rule['price_round'])
                                    / Math.log(10)))
                        );
                    }
                    price += (rule['price_surcharge']
                        ? rule['price_surcharge']
                        : 0.0);
                    if (rule['price_min_margin']) {
                        price = Math.max(
                            price, price_limit + rule['price_min_margin']
                        )
                    }
                    if (rule['price_max_margin']) {
                        price = Math.min(
                            price, price_limit + rule['price_min_margin']
                        )
                    }
                }
                break;
            }
            return price
        },
        /**
         * @param partner
         */
        update_products_ui: function (partner) {
            var db = this.db;
            if (!this.pos_widget.product_screen) return;
            var product_list_ui
                = this.pos_widget.product_screen.$(
                '.product-list span.product'
            );
            for (var i = 0, len = product_list_ui.length; i < len; i++) {
                var product_ui = product_list_ui[i];
                var product_id = $(product_ui).data('product-id');
                var product = $.extend({}, db.get_product_by_id(product_id));
                var rules = db.find_product_rules(product);
                var quantities = [];
                quantities.push(1);
                for (var j = 0; j < rules.length; j++) {
                    if ($.inArray(rules[j].min_quantity, quantities) === -1) {
                        quantities.push(rules[j].min_quantity);
                    }
                }
                quantities = quantities.sort();
                var prices_displayed = '';
                for (var k = 0; k < quantities.length; k++) {
                    var qty = quantities[k];
                    var price = this.compute_price_all(
                        db, product, partner, qty
                    );
                    if (price !== false) {
                        if (this.pos.config.display_price_with_taxes) {
                            var prices = this.simulate_price(
                                product, partner, price, qty
                            );
                            price = prices['priceWithTax']
                        }
                        price = round_di(parseFloat(price)
                            || 0, this.pos.dp['Product Price']);
                        price = this.pos_widget.format_currency(price);
                        if (k == 0) {
                            $(product_ui).find('.price-tag').html(price);
                        }
                        prices_displayed += qty
                            + 'x &#8594; ' + price + '<br/>';
                    }
                }
                if (prices_displayed != '') {
                    $(product_ui).find('.price-tag').attr(
                        'data-original-title', prices_displayed
                    );
                    $(product_ui).find('.price-tag').attr(
                        'data-toggle', 'tooltip'
                    );
                    $(product_ui).find('.price-tag').tooltip(
                        {delay: {show: 50, hide: 100}}
                    );
                }
            }
        },
        simulate_price: function (product, partner, price, qty) {
            // create a fake order in order to get price
            // for this customer
            var order = new models.Order({pos: this.pos});
            order.set_client(partner);
            var orderline = new models.Orderline
            ({}, {
                pos: this.pos, order: order,
                product: product, price: price
            });
            orderline.set_quantity(qty);
            // reset the sequence
            this.pos.pos_session.sequence_number--;
            var prices = orderline.get_all_prices();
            return prices;
        },
        /**
         *
         * @param partner
         * @param orderLines
         */
        update_ticket: function (partner, orderLines) {
            var db = this.db;
            for (var i = 0, len = orderLines.length; i < len; i++) {
                var line = orderLines[i];
                var product = line.product;
                var quantity = line.quantity;
                var price = this.compute_price_all(
                    db, product, partner, quantity
                );
                if (price !== false) {
                    line.price = price;
                }
                line.trigger('change', line);
            }
        }
    });

	/**
     * show error
     * @param context
     * @param message
     * @param comment
     */
    function show_error(context, message, comment) {
        context.pos.gui.show_popup('error', {
            'title': message,
            'body': comment
        });
    }

	/**
     * patch models to load some entities
     * @param pos_model
     */
    function arrange_elements(pos_model) {

        var product_model = pos_model.find_model('product.product');
        if (_.size(product_model) == 1) {
            var product_index = parseInt(Object.keys(product_model)[0]);
            pos_model.models[product_index].fields.push(
                'categ_id', 'seller_ids'
            );
        }

        var res_product_pricelist = pos_model.find_model('product.pricelist');
        if (_.size(res_product_pricelist) == 1) {
            var pricelist_index = parseInt(Object.keys(
                    res_product_pricelist)[0]
            );
	        //console.log('pos_model:', pos_model);
            pos_model.models.splice(++pricelist_index, 0,
                {
                    model: 'account.fiscal.position.tax',
                    fields: ['display_name',
                        'position_id',
                        'tax_src_id',
                        'tax_dest_id'],
                    domain: null,
                    loaded: function (self, fiscal_position_taxes) {
                        self.db.add_fiscal_position_taxes(
                            fiscal_position_taxes
                        );
                    }
                },
                {
                    model: 'product.supplierinfo',
                    fields: ['delay',
                        'name',
                        'min_qty',
                        'pricelist_ids',
                        'product_code',
                        'product_name',
                        'sequence',
                        'qty',
                        'product_tmpl_id'],
                    domain: null,
                    loaded: function (self, supplierinfos) {
                        self.db.add_supplierinfo(supplierinfos);
                    }
                },
                {
                    model: 'product.category',
                    fields: ['name',
                        'display_name',
                        'parent_id',
                        'child_id'],
                    domain: null,
                    loaded: function (self, categories) {
                        self.db.add_product_categories(categories);

                    }
                },
                {
                    model: 'product.pricelist',
                    fields: ['display_name',
                        'name',
                        'currency_id'],
                    domain: null,
                    loaded: function (self, pricelists) {
                        self.db.add_pricelists(pricelists);
                    }
                },
                {
                    model: 'product.pricelist.item',
                    fields: ['name',
                        'base',
                        'base_pricelist_id',
                        'categ_id',
                        'min_quantity',
                        'price_discount',
                        'price_max_margin',
                        'price_min_margin',
                        'price_round',
                        'price_surcharge',
                        'price_version_id',
                        'product_id',
                        'product_tmpl_id',
                        'sequence'
                    ],
                    domain: null,
                    loaded: function (self, items) {
                        self.db.add_pricelist_items(items);
                    }
                }
            );
        }

        var res_partner_model = pos_model.find_model('res.partner');
        if (_.size(res_partner_model) == 1) {
            var res_partner_index =
                parseInt(Object.keys(res_partner_model)[0]);
            pos_model.models[res_partner_index].fields.push(
                'property_account_position',
                'property_product_pricelist'
            );
        }
    }

	return models;

});

