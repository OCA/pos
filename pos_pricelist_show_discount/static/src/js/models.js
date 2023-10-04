odoo.define("pos_pricelist_show_discount.models", function (require) {
    "use strict";
    const models = require("point_of_sale.models");

    const order_super = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function () {
            order_super.initialize.apply(this, arguments);
            const self = this;
            const config = self.pos.config;
            if (
                config.use_pricelist === true &&
                config.display_discount_from_pricelist === true &&
                config.discount_pricelist_id
            ) {
                self.pos.discount_pricelist = _.find(self.pos.pricelists, function (
                    pricelist
                ) {
                    return pricelist.id === config.discount_pricelist_id[0];
                });
            } else {
                self.pos.discount_pricelist = self.pos.default_pricelist;
            }
        },
    });

    const orderline_super = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        get_lst_price: function () {
            const default_pricelist = this.pos.default_pricelist;
            this.pos.default_pricelist = this.pos.discount_pricelist;
            let lst_price = orderline_super.get_lst_price.apply(this, arguments);
            if (this.display_discount_policy() === "without_discount") {
                const self = this;
                const category_ids = [];
                let category = self.product.categ;
                while (category) {
                    category_ids.push(category.id);
                    category = category.parent;
                }
                const date = moment();
                const pricelist_items = _.filter(self.order.pricelist.items, function (
                    item
                ) {
                    return (
                        (!item.product_tmpl_id ||
                            item.product_tmpl_id[0] === self.product.product_tmpl_id) &&
                        (!item.product_id || item.product_id[0] === self.product.id) &&
                        (!item.categ_id ||
                            _.contains(category_ids, item.categ_id[0])) &&
                        (!item.date_start ||
                            moment.utc(item.date_start).isSameOrBefore(date)) &&
                        (!item.date_end ||
                            moment.utc(item.date_end).isSameOrAfter(date))
                    );
                });

                _.find(pricelist_items, function (rule) {
                    if (rule.base === "pricelist") {
                        lst_price = self.product.get_price(
                            rule.base_pricelist,
                            self.quantity
                        );
                    }
                });
            }
            this.pos.default_pricelist = default_pricelist;
            return lst_price;
        },

        /*
        New custom discount line
        */
        get_discount_pricelist_str: function () {
            const lst_price = this.get_taxed_lst_unit_price();
            const unit_price_discounted = this.get_display_price_one();
            return (((lst_price - unit_price_discounted) * 100) / lst_price).toFixed(2);
        },

        /*
        If the pos configuration is set to show the discount
        we ignore the discount policy on the pricelist
        */
        display_discount_policy: function () {
            if (this.pos.config.display_discount_from_pricelist) {
                return "without_discount";
            }
            return "with_discount";
        },

        export_as_JSON: function () {
            const res = orderline_super.export_as_JSON.apply(this, arguments);
            res.discount_pricelist_str = this.get_discount_pricelist_str();
            res.taxed_lst_unit_price = this.get_taxed_lst_unit_price();
            return res;
        },

        export_for_printing: function () {
            const res = orderline_super.export_for_printing.apply(this, arguments);
            res.discount_pricelist_str = this.get_discount_pricelist_str();
            res.taxed_lst_unit_price = this.get_taxed_lst_unit_price();
            return res;
        },
    });
});
