odoo.define("pos_access_right.CashMoveButton", function (require) {
    "use strict";
    const Registries = require("point_of_sale.Registries");
    const CashMoveButton = require("point_of_sale.CashMoveButton");

    const PosCashMoveButton = (CashMoveButton) =>
        class extends CashMoveButton {
            async onClick() {
                if (this.env.pos.config.module_pos_hr) {
                    if (this.env.pos.get_cashier().hasGroupCashinoutAction) {
                        return super.onClick();
                    }
                } else if (this.env.pos.user.hasGroupCashinoutAction)
                    return super.onClick();

                return false;
            }
        };

    Registries.Component.extend(CashMoveButton, PosCashMoveButton);
    return CashMoveButton;
});
