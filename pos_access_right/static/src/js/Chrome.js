odoo.define("pos_access_right.chrome", function (require) {
    "use strict";

    const Chrome = require("pos_hr.chrome");
    const Registries = require("point_of_sale.Registries");

    const PosAccessRightChrome = (Chrome) =>
        class extends Chrome {
            showCashMoveButton() {
                if (
                    this.env.pos.cashier &&
                    this.env.pos.cashier.hasGroupCashinoutAction
                )
                    return (
                        super.showCashMoveButton() ||
                        this.env.pos.cashier.hasGroupCashinoutAction
                    );
                return super.showCashMoveButton();
            }
        };

    Registries.Component.extend(Chrome, PosAccessRightChrome);

    return Chrome;
});
