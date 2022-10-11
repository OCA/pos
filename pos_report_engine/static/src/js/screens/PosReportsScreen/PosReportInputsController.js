odoo.define("pos_report_engine.PosReportInputsController", function (require) {
    "use strict";

    const {useExternalListener, useState} = owl.hooks;
    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");
    const ReportEngine = require("pos_report_engine.ReportEngine");
    const {useListener} = require("web.custom_hooks");
    const {Gui} = require("point_of_sale.Gui");

    class PosReportInputsController extends PosComponent {
        constructor() {
            super(...arguments);
            this.state = useState({
                currentInputs: [],
                currentReport: null,
                QWebReport: null,
            });
            useListener("generate-report", this.clickGenerateReport);
            useExternalListener(window, "change-report", this.changeInputs);
        }

        /**
         * Renders the respective inputs to the new selected report
         */
        changeInputs() {
            const currentReport = ReportEngine.getCurrentReport();
            this.state.currentInputs = currentReport.reportInputs;
        }

        async clickGenerateReport() {
            await this._generateQWebReport();
        }

        async _generateQWebReport() {
            try {
                const currentReport = ReportEngine.getCurrentReport();
                const context = this._generateReportContext();
                const reportInputMap = this._generetaReportInputsMap(currentReport);

                const QWebReport = await currentReport.reportGeneratorHandle(
                    context,
                    reportInputMap
                );
                ReportEngine.setCurrentReportQWeb(QWebReport);
            } catch (error) {
                const title = this.env._t("Could not generate report");
                const message =
                    this.env._t(
                        "The following error happened when calling the report generator handler: \n"
                    ) + error;
                this._showError(title, message);
                console.error(error);
            }
        }

        /**
         * Returns a set of POS context variables useful for the report generation function
         * @returns {Object} POS context variables
         */
        _generateReportContext() {
            return {
                env: this.env,
                rpc: this.rpc,
                session: this.session,
            };
        }

        /**
         * Returns object mapping the ids of the inputs with the reference of their elements on the screen,
         * to be used in the report generation function
         * @param {Object} currentReport Report Object
         * @returns {Object} Report Inputs Map
         */
        _generetaReportInputsMap(currentReport) {
            const reportInputsMap = {};
            currentReport.reportInputs.forEach((input) => {
                reportInputsMap[input.id] = document.getElementById(input.id);
            });
            return reportInputsMap;
        }

        _triggerRenderQWebReport() {
            const event = new CustomEvent("render-report", {
                detail: this.state.QWebReport,
            });
            window.dispatchEvent(event);
        }

        hasCurrentReport() {
            return ReportEngine.getCurrentReport();
        }

        /**
         * Display an error popup on the screen
         * @param {String} title: Error popup title
         * @param {String} msg: Error message to be displayed
         */
        _showError(title, msg) {
            Gui.showPopup("ErrorPopup", {
                title: title,
                body: msg,
            });
        }
    }
    PosReportInputsController.template = "PosReportInputsController";

    Registries.Component.add(PosReportInputsController);

    return PosReportInputsController;
});
