odoo.define("pos_report_engine.PosReportsButton", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class PosReportsButton extends PosComponent {
        async onClick() {
            this.showScreen("PosReportsScreen");
        }
    }
    PosReportsButton.template = "PosReportsButton";

    Registries.Component.add(PosReportsButton);

    return PosReportsButton;
});
