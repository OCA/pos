odoo.define("pos_access_right.chrome", function (require) {
    "use strict";

    const Chrome = require("point_of_sale.Chrome");
    const Registries = require("point_of_sale.Registries");

    const PosAccessRightChrome = (Chrome) =>
        class extends Chrome {
            showCashMoveButton() {
                if (this.env.pos.config.module_pos_hr) {
                    if (this.env.pos.get_cashier().hasGroupCashinoutAction) {
                        return (
                            super.showCashMoveButton() ||
                            this.env.pos.get_cashier().hasGroupCashinoutAction
                        );
                    }
                } else if (this.env.pos.user.hasGroupCashinoutAction)
                    return (
                        super.showCashMoveButton() ||
                        this.env.pos.user.hasGroupCashinoutAction
                    );
            }
        };

    Registries.Component.extend(Chrome, PosAccessRightChrome);

    return Chrome;
});
