odoo.define('pos_product_multi_price.models', function (require) {
"use strict";

var models = require('point_of_sale.models');

models.load_fields("product.product", ["price_ids_json"]);

var _product_super = models.Product.prototype;
models.Product = models.Product.extend({
    get_price: function(pricelist, quantity) {
        // partially copied from "point_of_sale.models"

        var self = this;
        var price_ids_json = JSON.parse(this.price_ids_json);
        var price = _product_super.get_price.apply(this, arguments);

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
                   (! item.date_start || moment(item.date_start).isSameOrBefore(date)) &&
                   (! item.date_end || moment(item.date_end).isSameOrAfter(date));
        });
        _.find(pricelist_items, function (rule) {
            if (rule.min_quantity && quantity < rule.min_quantity) {
                return false;
            }
            if (rule.base === 'multi_price' && rule.compute_price == 'formula') {
                _.forEach(price_ids_json, function (multi_price) {
                    if (multi_price.price_id == rule.multi_price_name[0]) {
                        price = multi_price.price;
                        var price_limit = price;
                        price = price - (price * (rule.price_discount / 100));
                        if (rule.price_round) {
                            price = round_pr(price, rule.price_round);
                        }
                        if (rule.price_surcharge) {
                            price += rule.price_surcharge;
                        }
                        if (rule.price_min_margin) {
                            price = Math.max(price, price_limit + rule.price_min_margin);
                        }
                        if (rule.price_max_margin) {
                            price = Math.min(price, price_limit + rule.price_max_margin);
                        }
                        return true;
                    }
                });
            }
            return false
        });
        return price;
    },
});

});
