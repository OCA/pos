odoo.define("pos_access_right.NumpadWidget", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const NumpadWidget = require("point_of_sale.NumpadWidget");

    const PosNumpadWidget = (NumpadWidget) =>
        class extends NumpadWidget {
            get hasManualDiscount() {
                const res = super.hasManualDiscount;
                if (res) {
                    if (this.env.pos.get_cashier().hasGroupDiscount) {
                        return true;
                    }
                    return false;
                }
                return res;
            }
            get hasMinusControlRights() {
                if (this.env.pos.get_cashier().hasGroupNegativeQty) {
                    return true;
                }
                return false;
            }
            get hasPriceControlRights() {
                const res = super.hasPriceControlRights;
                if (res) {
                    if (this.env.pos.get_cashier().hasGroupPriceControl) {
                        return true;
                    }
                    return false;
                }
                return res;
            }
        };

    Registries.Component.extend(NumpadWidget, PosNumpadWidget);

    return NumpadWidget;
});
