odoo.define("pos_show_discount_percentage", function (require) {
    "use strict";

    // As per https://odoo-development.readthedocs.io/en/latest/dev/pos/inheritance.html

    const models = require("point_of_sale.models");
    const utils = require("web.utils");
    const round_pr = utils.round_precision;

    const _super_orderline = models.Orderline.prototype;

    models.Order = models.Order.extend({
        get_total_discount: function () {
            return round_pr(
                this.orderlines.reduce(function (sum, orderLine) {
                    const price = orderLine.get_unit_price();
                    const price_lst = orderLine.get_lst_price();
                    sum +=
                        price *
                        (orderLine.get_discount() / 100) *
                        orderLine.get_quantity();
                    if (
                        orderLine.display_discount_policy() === "without_discount" &&
                        price < price_lst &&
                        price_lst > 0 &&
                        price > 0
                    ) {
                        sum += (price_lst - price) * orderLine.get_quantity();
                    }
                    return sum;
                }, 0),
                this.pos.currency.rounding
            );
        },
    });

    models.Orderline = models.Orderline.extend({
        get_discount_str: function () {
            const price = this.get_unit_display_price();
            const price_lst = this.get_lst_price();
            if (
                this.display_discount_policy() == "without_discount" &&
                price < price_lst &&
                price_lst > 0 &&
                price > 0
            ) {
                return Math.round(100 * (1 - price / price_lst));
            }
            return _super_orderline.get_discount_str.apply(this);
        },
    });
});
