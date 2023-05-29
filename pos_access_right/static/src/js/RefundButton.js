odoo.define("pos_access_right.RefundButton", function (require) {
    "use strict";
    const Registries = require("point_of_sale.Registries");
    const RefundButton = require("point_of_sale.RefundButton");

    const PosRefundButton = (RefundButton) =>
        class extends RefundButton {
            get hasRefundButtonRights() {
                if (this.env.pos.config.module_pos_hr)
                    return this.env.pos.get_cashier().hasGroupRefundAction;
                return this.env.pos.user.hasGroupRefundAction;
            }
        };

    Registries.Component.extend(RefundButton, PosRefundButton);
    return RefundButton;
});
