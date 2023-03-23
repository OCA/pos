odoo.define("pos_restrict_price_discount_buttons.NumpadWidget", function (require) {
    "use strict";

    const NumpadWidget = require("point_of_sale.NumpadWidget");
    const Registries = require("point_of_sale.Registries");

    const RestrictButtonsNumpadWidget = (NumpadWidget) =>
        class extends NumpadWidget {
            get hasPriceControlRights() {
                const config = this.env.pos.config;
                if (config.restrict_price_button) {
                    const users = config.restrict_price_users_ids;
                    return users.includes(this.env.pos.user.id);
                }
                return super.setup();
            }

            get hasManualDiscount() {
                const config = this.env.pos.config;
                if (config.restrict_discount_button) {
                    const users = config.restrict_discount_users_ids;
                    return users.includes(this.env.pos.user.id);
                }
                return super.setup();
            }
        };

    Registries.Component.extend(NumpadWidget, RestrictButtonsNumpadWidget);

    return NumpadWidget;
});
