odoo.define("pos_access_right.ActionpadWidget", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const ActionpadWidget = require("point_of_sale.ActionpadWidget");

    const PosActionpadWidget = (ActionpadWidget) =>
        class extends ActionpadWidget {
            get hasPaymentControlRights() {
                return this.env.pos.get_cashier().hasGroupPayment;
            }
        };

    Registries.Component.extend(ActionpadWidget, PosActionpadWidget);

    return ActionpadWidget;
});
