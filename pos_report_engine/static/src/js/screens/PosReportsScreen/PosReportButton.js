odoo.define("pos_report_engine.PosReportButton", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class PosReportButton extends PosComponent {
        constructor() {
            super(...arguments);
            this.id = this.props.id;
            this.name = this.props.name;
        }
    }
    PosReportButton.template = "PosReportButton";

    Registries.Component.add(PosReportButton);

    return PosReportButton;
});
