odoo.define("pos_bypass_global_discount.models", function (require) {
    "use strict";

    const {Orderline} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    const PosBypassDiscountOrderline = (Orderline) =>
        class PosBypassDiscountOrderline extends Orderline {
            isGlobalDiscountApplicable() {
                const res = super.isGlobalDiscountApplicable();
                return !this.product.bypass_global_discount && res;
            }
        };
    Registries.Model.extend(Orderline, PosBypassDiscountOrderline);
});
