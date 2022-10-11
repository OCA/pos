odoo.define("pos_report_engine.PosReportTextInput", function (require) {
    "use strict";

    const {useState} = owl.hooks;
    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class PosReportTextInput extends PosComponent {
        constructor() {
            super(...arguments);
            this.state = useState({text: ""});
            this.id = this.props.id;
        }
    }
    PosReportTextInput.template = "PosReportTextInput";

    Registries.Component.add(PosReportTextInput);

    return PosReportTextInput;
});
