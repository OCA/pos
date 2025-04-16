odoo.define("pos_access_right.NumpadWidget", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const NumpadWidget = require("point_of_sale.NumpadWidget");

    const PosNumpadWidget = (OriginalNumpadWidget) =>
        class extends OriginalNumpadWidget {
            get hasManualDiscount() {
                const res = super.hasManualDiscount;
                if (res) {
                    if (this.env.pos.config.module_pos_hr)
                        return this.env.pos.cashier.hasGroupDiscount;
                    return this.env.pos.user.hasGroupDiscount;
                }
                return res;
            }
            get hasMinusControlRights() {
                if (this.env.pos.config.module_pos_hr)
                    return this.env.pos.cashier.hasGroupNegativeQty;
                return this.env.pos.user.hasGroupNegativeQty;
            }
            get hasPriceControlRights() {
                const res = super.hasPriceControlRights;
                if (res) {
                    if (this.env.pos.config.module_pos_hr)
                        return this.env.pos.cashier.hasGroupPriceControl;
                    return this.env.pos.user.hasGroupPriceControl;
                }
                return res;
            }
        };

    Registries.Component.extend(NumpadWidget, PosNumpadWidget);

    return NumpadWidget;
});
