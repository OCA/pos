odoo.define("pos_report_engine.PosReportDatePickerInput", function (require) {
    "use strict";

    const {useState} = owl.hooks;
    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class PosReportDatePickerInput extends PosComponent {
        constructor() {
            super(...arguments);
            this.state = useState({text: ""});
            this.id = this.props.id;
        }
    }
    PosReportDatePickerInput.template = "PosReportDatePickerInput";

    Registries.Component.add(PosReportDatePickerInput);

    return PosReportDatePickerInput;
});
