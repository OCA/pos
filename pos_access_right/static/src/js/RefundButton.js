odoo.define("pos_access_right.RefundButton", function (require) {
    "use strict";
    const Registries = require("point_of_sale.Registries");
    const RefundButton = require("point_of_sale.RefundButton");

    const PosRefundButton = (RefundButton) =>
        class extends RefundButton {
            _onClick() {
                if (this.env.pos.config.module_pos_hr) {
                    if (this.env.pos.get_cashier().hasGroupRefundAction) {
                        return super._onClick();
                    }
                } else if (this.env.pos.user.hasGroupRefundAction)
                    return super._onClick();

                return false;
            }
        };

    Registries.Component.extend(RefundButton, PosRefundButton);
    return RefundButton;
});
