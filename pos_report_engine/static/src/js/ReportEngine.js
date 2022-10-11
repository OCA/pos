odoo.define("pos_report_engine.ReportEngine", function () {
    "use strict";

    const ReportEngine = Backbone.Model.extend({
        initialize: function (attributes) {
            Backbone.Model.prototype.initialize.call(this, attributes);
            this.reports = {};
            this.currentReport = null;
            this.currentReportQWeb = null;
        },

        /**
         * Adds new reports by registering the object with the appropriate information.
         * @param {Object} report Report information to be added by the engine
         * @param {String} report.id The report id
         * @param {String} report.name Report name to be rendered on the button
         * @param {function} report.reportGeneratorHandle Function responsible for generating and returning report to be rendered
         * @param {list} report.reportInputs List of data inputs components objects required for report generation
         * @param {String} printClass Optional - Custom style for printing
         * @param {String} renderClass Optional - Custom style for render on screen
         */
        addReport: function (report) {
            this.reports[report.id] = report;
        },

        getReportsList() {
            return Object.values(this.reports);
        },

        getCurrentReport: function () {
            return this.currentReport;
        },

        /**
         * Function responsible for set the current report and triggering the event that will notify the
         * PosReportController and PosReportContainer components that a new report has been selected
         * @param {String} reportId New current report ID
         */
        setCurrentReportById: function (reportId) {
            this.currentReport = this.reports[reportId];

            const event = new CustomEvent("change-report", {});
            window.dispatchEvent(event);
        },

        /**
         * Function responsible for set the current QWEB report and triggering the event that will notify the
         * PosReportContainer component to render the new report
         * @param {String} reportQWeb HTML Report
         */
        setCurrentReportQWeb: function (reportQWeb) {
            this.currentReportQWeb = reportQWeb;
            const event = new CustomEvent("render-report", {});
            window.dispatchEvent(event);
        },

        getCurrentReportQWeb: function () {
            return this.currentReportQWeb;
        },
    });

    return new ReportEngine();
});
