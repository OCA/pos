odoo.define("pos_show_discount_percentage", function (require) {
    "use strict";

    // As per https://odoo-development.readthedocs.io/en/latest/dev/pos/inheritance.html

    const models = require("point_of_sale.models");

    const _super_orderline = models.Orderline.prototype;

    models.Orderline = models.Orderline.extend({
        get_discount_str: function () {
            const _super_discount_str = _super_orderline.get_discount_str.apply(this);
            if (
                _super_discount_str === "0" &&
                this.get_unit_display_price() !== this.get_taxed_lst_unit_price()
            ) {
                return Math.round(
                    100 *
                        (1 -
                            this.get_unit_display_price() /
                                this.get_taxed_lst_unit_price())
                );
            }
            return _super_discount_str;
        },
    });
});
