odoo.define("pos_report_engine.PosReportButtonList", function (require) {
    "use strict";

    const {useState} = owl.hooks;
    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");
    const ReportEngine = require("pos_report_engine.ReportEngine");
    const {useListener} = require("web.custom_hooks");

    class PosReportButtonList extends PosComponent {
        constructor() {
            super(...arguments);
            this.state = useState({selectedReport: null});
            useListener("click-report", this._changeReport);
        }

        /**
         * Function triggered when selecting a report by the buttons
         * @param {OwlEvent} event Event fired when clicking report buttons
         */
        _changeReport(event) {
            const reportId = event.detail;
            this.state.selectedReport = reportId;
            ReportEngine.setCurrentReportById(reportId);
            ReportEngine.setCurrentReportQWeb(null);
        }

        getReportList() {
            return ReportEngine.getReportsList();
        }

        getCurrentReport() {
            return ReportEngine.getCurrentReport();
        }
    }
    PosReportButtonList.template = "PosReportButtonList";

    Registries.Component.add(PosReportButtonList);

    return PosReportButtonList;
});
