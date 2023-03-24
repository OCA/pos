odoo.define("pos_restrict_price_discount_buttons.NumpadWidget", function (require) {
    "use strict";

    const NumpadWidget = require("point_of_sale.NumpadWidget");
    const Registries = require("point_of_sale.Registries");

    const RestrictButtonsNumpadWidget = (NumpadWidget) =>
        class extends NumpadWidget {
            get hasPriceControlRights() {
                if (this.env.pos.config.restrict_price_button) {
                    const employees = this.env.pos.config.restrict_price_employee_ids;
                    return employees.includes(this.env.pos.cashier.id);
                }
                return super.hasPriceControlRights;
            }

            get hasManualDiscount() {
                if (this.env.pos.config.restrict_discount_button) {
                    const employees =
                        this.env.pos.config.restrict_discount_employee_ids;
                    return employees.includes(this.env.pos.cashier.id);
                }
                return super.hasManualDiscount;
            }
        };

    Registries.Component.extend(NumpadWidget, RestrictButtonsNumpadWidget);

    return RestrictButtonsNumpadWidget;
});
