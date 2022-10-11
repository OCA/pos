odoo.define("pos_report_engine.PosReportContainer", function (require) {
    "use strict";

    const {useExternalListener, useState} = owl.hooks;
    const {useListener} = require("web.custom_hooks");
    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");
    const ReportEngine = require("pos_report_engine.ReportEngine");

    class PosReportContainer extends PosComponent {
        constructor() {
            super(...arguments);
            this.state = useState({QWebReport: null});
            useListener("print-report", this.printReport);
            useExternalListener(window, "change-report", this.renderQWebReport);
            useExternalListener(window, "render-report", this.renderQWebReport);
        }

        async printReport() {
            const printableReport = this._styleReport("print");
            const printResult = await this.env.pos.proxy.printer.print_receipt(
                printableReport
            );
            if (!printResult.successful) {
                await this.showPopup("ErrorPopup", {
                    title: printResult.message.title,
                    body: printResult.message.body,
                });
            }
        }

        _styleReport(styleOption) {
            const currentReport = ReportEngine.getCurrentReport();
            let styleClass = "";

            if (styleOption === "render") {
                styleClass = currentReport.renderClass;
            } else if (styleOption === "print") {
                styleClass = currentReport.printClass;
            }

            return `<div class="pos-receipt ${styleClass}">${this.state.QWebReport}</div>`;
        }

        renderQWebReport() {
            this.state.QWebReport = ReportEngine.getCurrentReportQWeb();
            if (this.state.QWebReport) {
                this.state.renderQWebReport = this._styleReport("render");
            } else {
                this.state.renderQWebReport = null;
            }
        }
    }
    PosReportContainer.template = "PosReportContainer";

    Registries.Component.add(PosReportContainer);

    return PosReportContainer;
});
