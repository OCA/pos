odoo.define("pos_pricelist_show_discount.models", function (require) {
    "use strict";
    var models = require("point_of_sale.models");
    var orderline_super = models.Orderline.prototype;

    models.Orderline = models.Orderline.extend({
        get_lst_price: function () {
            var lst_price = orderline_super.get_lst_price.apply(this, arguments);
            if (this.display_discount_policy() === "without_discount") {
                var self = this;
                var category_ids = [];
                var category = self.product.categ;
                while (category) {
                    category_ids.push(category.id);
                    category = category.parent;
                }
                var date = moment();
                var pricelist_items = _.filter(self.order.pricelist.items, function (
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
            return lst_price;
        },
    });
});
