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
function pos_pricelist_models(instance, module) {

    var _t = instance.web._t;
    var round_pr = instance.web.round_precision;
    var round_di = instance.web.round_decimals;

    /**
     * @param funcName
     * @returns {*}
     * @private
     */
    Backbone.Model.prototype._super = function (funcName) {
        return this.constructor.__super__[funcName].apply(this, _.rest(arguments));
    };

    /**
     * Extend the POS model
     */
    module.PosModel = module.PosModel.extend({
        initialize: function (session, attributes) {
            this._super('initialize', session, attributes);
            this.pricelist_engine = new module.PricelistEngine({'pos': this, 'db': this.db, 'pos_widget': this.pos_widget});
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
        on_removed_order: function (removed_order, index, reason) {
            this._super('on_removed_order', removed_order, index, reason);
            if ((reason === 'abandon' || removed_order.temporary) && this.get('orders').size() > 0) {
                var current_order = (this.get('orders').at(index) || this.get('orders').last());
                var partner = current_order.get_client() ? current_order.get_client() : false;
                this.pricelist_engine.update_products_ui(partner);
            }
        }
    });

    /**
     * Extend the order
     */
    module.Order = module.Order.extend({
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
            var line = new module.Orderline({}, {pos: this.pos, order: this, product: product});
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
                if (_line && _line.can_be_merged_with(line) && options.merge !== false) {
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
    module.Orderline = module.Orderline.extend({
        initialize: function (attr, options) {
            this._super('initialize', attr, options);
            this.manuel_price = false;
            if (options.product !== undefined) {
                var qty = this.compute_qty(options.order, options.product);
                var partner = options.order.get_client();
                var product = options.product;
                var db = this.pos.db;
                var price = this.pos.pricelist_engine.compute_price_all(db, product, partner, qty);
                if (price !== false && price !== 0.0) {
                    this.price = price;
                }
            }
        },
        /**
         * @param state
         */
        set_manuel_price: function (state) {
            this.manuel_price = state;
        },
        /**
         * @param quantity
         */
        set_quantity: function (quantity) {
            this._super('set_quantity', quantity);
            var partner = this.order.get_client();
            var product = this.product;
            var db = this.pos.db;
            var price = this.pos.pricelist_engine.compute_price_all(db, product, partner, quantity);
            if (price !== false && price !== 0.0) {
                this.price = price;
            }
            this.trigger('change', this);
        },
        /**
         * override this method to take fiscal positions in consideration
         * get all price
         * TODO : find a better way to do it : need some refactoring in the pos standard
         * @returns {{priceWithTax: *, priceWithoutTax: *, tax: number, taxDetails: {}}}
         */
        get_all_prices: function () {

            var self = this;
            var currency_rounding = this.pos.currency.rounding;
            var base = this.get_base_price();
            var totalTax = base;
            var totalNoTax = base;
            var product = this.get_product();
            var taxes = this.get_applicable_taxes();
            var taxtotal = 0;
            var taxdetail = {};

            // Add by pos_pricelist
            var partner = this.order.get_client();
            var fiscal_position_taxes = [];
            if (partner && partner.property_account_position) {
                fiscal_position_taxes = self.pos.db.find_taxes_by_fiscal_position_id(partner.property_account_position[0]);
            }
            var product_taxes = [];
            for (var i = 0, ilen = fiscal_position_taxes.length; i < ilen; i++) {
                var fp_tax = fiscal_position_taxes[i];
                for (var j = 0, jlen = taxes.length; j < jlen; j++) {
                    var p_tax = taxes[j];
                    if (fp_tax && p_tax && fp_tax.tax_src_id[0] === p_tax.id) {
                        var dest_tax = _.detect(this.pos.taxes, function (t) {
                            return t.id === fp_tax.tax_dest_id[0];
                        });
                        product_taxes.push(dest_tax);
                    }
                }
            }
            if (product_taxes.length === 0) {
                for (var i = 0, ilen = product.taxes_id; i < ilen; i++) {
                    var _id = product.taxes_id[i];
                    var p_tax = _.detect(this.pos.taxes, function (t) {
                        return t.id === _id;
                    });
                    product_taxes.push(p_tax);
                }
            }
            _.each(product_taxes, function (tax) {
                if (tax.price_include) {
                    var tmp;
                    if (tax.type === "percent") {
                        tmp = base - round_pr(base / (1 + tax.amount), currency_rounding);
                    } else if (tax.type === "fixed") {
                        tmp = round_pr(tax.amount * self.get_quantity(), currency_rounding);
                    } else {
                        throw "This type of tax is not supported by the point of sale: " + tax.type;
                    }
                    tmp = round_pr(tmp, currency_rounding);
                    taxtotal += tmp;
                    totalNoTax -= tmp;
                    taxdetail[tax.id] = tmp;
                } else {
                    var tmp;
                    if (tax.type === "percent") {
                        tmp = tax.amount * base;
                    } else if (tax.type === "fixed") {
                        tmp = tax.amount * self.get_quantity();
                    } else {
                        throw "This type of tax is not supported by the point of sale: " + tax.type;
                    }
                    tmp = round_pr(tmp, currency_rounding);
                    if (tax.include_base_amount) {
                        base += tmp;
                    }
                    taxtotal += tmp;
                    totalTax += tmp;
                    taxdetail[tax.id] = tmp;
                }
            });
            return {
                "priceWithTax": totalTax,
                "priceWithoutTax": totalNoTax,
                "tax": taxtotal,
                "taxDetails": taxdetail
            };
        },
        /**
         * Override this method to avoid a return false if the price is different
         * Check super method : (this.price !== orderline.price) is not necessary in our case
         * @param orderline
         * @returns {boolean}
         */
        can_be_merged_with: function (orderline) {
            var result = this._super('can_be_merged_with', orderline);
            if (!result) {
                if (!this.manuel_price) {
                    return (this.get_product().id === orderline.get_product().id);
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
            this._super('merge', orderline);
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
            if (order.get('orderLines').models !== undefined) {
                orderlines = order.get('orderLines').models;
            }
            for (var i = 0; i < orderlines.length; i++) {
                if (orderlines[i].product.id === product.id && !orderlines[i].manuel_price) {
                    qty += orderlines[i].quantity;
                }
            }
            return qty;
        },
    });

    /**
     * Pricelist Engine to compute price
     */
    module.PricelistEngine = instance.web.Class.extend({
        init: function(options){
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
                price_list_id = db.default_pricelist_id;
            }
            return this.compute_price(db, product, partner, qty, parseInt(price_list_id));
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
                if (((v.date_start == false) || (new Date(v.date_start) <= date)) &&
                    ((v.date_end == false) || (new Date(v.date_end) >= date))) {
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
            var version = this.find_valid_pricelist_version(db, pricelist_id);
            if (version == false) {
                var message = _t('Pricelist Error');
                var comment = _t('At least one pricelist has no active version ! Please create or activate one.');
                show_error(this, message, comment);
                return false;
            }

            // get categories
            var categ_ids = [];
            if (product.categ_id) {
                categ_ids.push(product.categ_id[0]);
                categ_ids = categ_ids.concat(db.product_category_ancestors[product.categ_id[0]]);
            }

            // find items
            var items = [], i, len;
            for (i = 0, len = db.pricelist_item_sorted.length; i < len; i++) {
                var item = db.pricelist_item_sorted[i];
                if ((item.product_id === false || item.product_id[0] === product.id) &&
                    (item.categ_id === false || categ_ids.indexOf(item.categ_id[0]) !== -1) &&
                    (item.price_version_id[0] === version.id)) {
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
                if (rule.product_id && rule.product_id[0] && product.id != rule.product_id[0]) {
                    continue;
                }
                if (rule.categ_id) {
                    var cat_id = product.categ_id[0];
                    while (cat_id) {
                        if (cat_id == rule.categ_id[0]) {
                            break;
                        }
                        cat_id = db.product_category_by_id[cat_id].parent_id[0];
                    }
                    if (!(cat_id)) {
                        continue;
                    }
                }
                // Based on field
                switch (rule.base) {
                    case -1:
                        if (rule.base_pricelist_id) {
                            price = self.compute_price(db, product, false, qty, rule.base_pricelist_id[0]);
                        }
                        break;
                    case -2:
                        var seller = false;
                        for (var index in product.seller_ids) {
                            var seller_id = product.seller_ids[index];
                            var _tmp_seller = db.supplierinfo_by_id[seller_id];
                            if ((!partner) || (_tmp_seller.name.length && _tmp_seller.name[0] != partner.name))
                                continue;
                            seller = _tmp_seller
                        }
                        if (!seller && product.seller_ids) {
                            seller = db.supplierinfo_by_id[product.seller_ids[0]];
                        }
                        if (seller) {
                            for (var _id in seller.pricelist_ids) {
                                var info_id = seller.pricelist_ids[_id];
                                var line = db.pricelist_partnerinfo_by_id[info_id];
                                if (line.min_quantity <= qty) {
                                    price = line.price
                                }
                            }
                        }
                        break;
                    default:
                        if (!price_types.hasOwnProperty(rule.base)) {
                            price_types[rule.base] = db.product_price_type_by_id[rule.base];
                        }
                        var price_type = price_types[rule.base];
                        if (db.product_by_id[product.id].hasOwnProperty(price_type.field)) {
                            price = db.product_by_id[product.id][price_type.field];
                        }
                }
                if (price !== false) {
                    var price_limit = price;
                    price = price * (1.0 + (rule['price_discount'] ? rule['price_discount'] : 0.0))
                    if (rule['price_round']) {
                        price = parseFloat(price.toFixed(Math.ceil(Math.log(1.0 / rule['price_round']) / Math.log(10))));
                    }
                    price += (rule['price_surcharge'] ? rule['price_surcharge'] : 0.0);
                    if (rule['price_min_margin']) {
                        price = Math.max(price, price_limit + rule['price_min_margin'])
                    }
                    if (rule['price_max_margin']) {
                        price = Math.min(price, price_limit + rule['price_min_margin'])
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
            if(!this.pos_widget.product_screen) return;
            var product_list_ui = this.pos_widget.product_screen.$('.product-list span.product');
            for (var i = 0, len = product_list_ui.length; i < len; i++) {
                var product_ui = product_list_ui[i];
                var product_id = $(product_ui).data('product-id');
                var product = db.get_product_by_id(product_id);
                var price = this.compute_price_all(db, product, partner, 1);
                if (price !== false && price !== 0.0) {
                    price = round_di(parseFloat(price) || 0, this.pos.dp['Product Price']);
                    price = this.pos_widget.format_currency(price);
                    $(product_ui).find('.price-tag').html(price);
                }
            }
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
                var price = this.compute_price_all(db, product, partner, quantity);
                if (price !== false && price !== 0.0) {
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
        context.pos.pos_widget.screen_selector.show_popup('error', {
            'message': message,
            'comment': comment
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
            pos_model.models[product_index].fields.push('categ_id', 'seller_ids');
        }

        var res_product_pricelist = pos_model.find_model('product.pricelist');
        if (_.size(res_product_pricelist) == 1) {
            var pricelist_index = parseInt(Object.keys(res_product_pricelist)[0]);
            pos_model.models.splice(++pricelist_index, 0,
                {
                    model: 'account.fiscal.position.tax',
                    fields: ['display_name', 'position_id', 'tax_src_id', 'tax_dest_id'],
                    domain: null,
                    loaded: function (self, fiscal_position_taxes) {
                        self.db.add_fiscal_position_taxes(fiscal_position_taxes);
                    }
                },
                {
                    model: 'pricelist.partnerinfo',
                    fields: ['display_name', 'min_quantity', 'name', 'price', 'suppinfo_id'],
                    domain: null,
                    loaded: function (self, pricelist_partnerinfos) {
                        self.db.add_pricelist_partnerinfo(pricelist_partnerinfos);
                    }
                },
                {
                    model: 'product.supplierinfo',
                    fields: ['delay', 'name', 'min_qty', 'pricelist_ids', 'product_code', 'product_name', 'sequence',
                        'qty', 'product_tmpl_id'],
                    domain: null,
                    loaded: function (self, supplierinfos) {
                        self.db.add_supplierinfo(supplierinfos);
                    }
                },
                {
                    model: 'product.category',
                    fields: ['name', 'display_name', 'parent_id', 'child_id'],
                    domain: null,
                    loaded: function (self, categories) {
                        self.db.add_product_categories(categories);

                    }
                },
                {
                    model: 'ir.model.data',
                    fields: ['res_id'],
                    domain: function () {
                        return [
                            ['module', '=', 'product'],
                            ['name', '=', 'property_product_pricelist']
                        ]
                    },
                    loaded: function (self, res) {
                        self.db.add_default_pricelist(res);
                    }
                },
                {
                    model: 'product.pricelist',
                    fields: ['display_name', 'name', 'version_id', 'currency_id'],
                    domain: function () {
                        return [
                            ['type', '=', 'sale']
                        ]
                    },
                    loaded: function (self, pricelists) {
                        self.db.add_pricelists(pricelists);
                    }
                },
                {
                    model: 'product.pricelist.version',
                    fields: ['name', 'pricelist_id', 'date_start', 'date_end', 'items'],
                    domain: null,
                    loaded: function (self, versions) {
                        self.db.add_pricelist_versions(versions);
                    }
                },
                {
                    model: 'product.pricelist.item',
                    fields: ['name', 'base', 'base_pricelist_id', 'categ_id', 'min_quantity',
                        'price_discount', 'price_max_margin', 'price_min_margin', 'price_round', 'price_surcharge',
                        'price_version_id', 'product_id', 'product_tmpl_id', 'sequence'
                    ],
                    domain: null,
                    loaded: function (self, items) {
                        self.db.add_pricelist_items(items);
                    }
                },
                {
                    model: 'product.price.type',
                    fields: ['name', 'field', 'currency_id'],
                    domain: null,
                    loaded: function (self, price_types) {
                        // we need to add price type field to product.product model if not the case
                        var product_model = posmodel.find_model('product.product');
                        for(var i = 0, len = price_types.length; i < len; i++) {
                            var p_type = price_types[i].field;
                            if (_.size(product_model) == 1) {
                                var product_index = parseInt(Object.keys(product_model)[0]);
                                if(posmodel.models[product_index].fields.indexOf(p_type) === -1) {
                                    posmodel.models[product_index].fields.push(p_type);
                                }
                            }
                        }
                        self.db.add_price_types(price_types);
                    }
                }
            );
        }

        var res_partner_model = pos_model.find_model('res.partner');
        if (_.size(res_partner_model) == 1) {
            var res_partner_index = parseInt(Object.keys(res_partner_model)[0]);
            pos_model.models[res_partner_index].fields.push('property_account_position', 'property_product_pricelist');
        }

    }

}
