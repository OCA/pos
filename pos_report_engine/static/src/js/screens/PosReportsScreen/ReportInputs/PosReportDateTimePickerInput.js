odoo.define("pos_report_engine.PosReportDateTimePickerInput", function (require) {
    "use strict";

    const {useState} = owl.hooks;
    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class PosReportDateTimePickerInput extends PosComponent {
        constructor() {
            super(...arguments);
            this.state = useState({text: ""});
            this.id = this.props.id;
        }
    }
    PosReportDateTimePickerInput.template = "PosReportDateTimePickerInput";

    Registries.Component.add(PosReportDateTimePickerInput);

    return PosReportDateTimePickerInput;
});
