odoo.define("pos_access_right.ActionpadWidget", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const ActionpadWidget = require("point_of_sale.ActionpadWidget");

    const PosActionpadWidget = (OriginalActionpadWidget) =>
        class extends OriginalActionpadWidget {
            get hasPaymentControlRights() {
                if (this.env.pos.config.module_pos_hr)
                    return this.env.pos.cashier.hasGroupPayment;
                return this.env.pos.user.hasGroupPayment;
            }
        };

    Registries.Component.extend(ActionpadWidget, PosActionpadWidget);

    return ActionpadWidget;
});
