odoo.define("pos_access_right.NumpadWidget", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const NumpadWidget = require("point_of_sale.NumpadWidget");

    const PosNumpadWidget = (NumpadWidget) =>
        class extends NumpadWidget {
            get hasManualDiscount() {
                const res = super.hasManualDiscount;
                if (res) {
                    return this.env.pos.get_cashier().hasGroupDiscount;
                }
                return res;
            }
            get hasMinusControlRights() {
                return this.env.pos.get_cashier().hasGroupNegativeQty;
            }
            get hasPriceControlRights() {
                const res = super.hasPriceControlRights;
                if (res) {
                    return this.env.pos.get_cashier().hasGroupPriceControl;
                }
                return res;
            }

            get hasDeleteOrderLineRights() {
                return this.env.pos.get_cashier().hasGroupDeleteOrder;
            }

        };

    Registries.Component.extend(NumpadWidget, PosNumpadWidget);

    return NumpadWidget;
});
