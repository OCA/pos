odoo.define("pos_cash_control.HeaderButton", function (require) {
    "use strict";

    const HeaderButton = require("point_of_sale.HeaderButton");
    const Registries = require("point_of_sale.Registries");

    const CashControlHeaderButton = (HeaderButton) =>
        class extends HeaderButton {
            /**
             * @override
             */
            async onClick() {
                const info = await this.env.pos.getClosePosInfo();
                this.showPopup("ClosePosPopup", {info: info});
            }
        };

    Registries.Component.extend(HeaderButton, CashControlHeaderButton);

    return HeaderButton;
});
