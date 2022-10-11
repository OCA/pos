odoo.define("pos_report_engine.ExampleReports", function (require) {
    "use strict";

    const ReportEngine = require("pos_report_engine.PosReportEngine");
    const textInput = require("pos_report_engine.PosReportTextInput");
    const datePickerInput = require("pos_report_engine.PosReportDatePickerInput");

    const getEmployeeSales = function () {
        const nameInputValue = document.getElementById("name_input").value;
        // Mocked report
        const report = `
            <div>
                <h3>Employee Report</h3>
                <div>Employee Name: ${nameInputValue}</div>
                <div>Sales amount: 10000.00</div>
            </div>
        `;
        return report;
    };

    const getSalesReportbyPeriod = function () {
        const initialDateValue = document.getElementById("initial_date").value;
        const finalDateValue = document.getElementById("final_date").value;

        // Mocked report
        const report = `
            <div>
                <h3>Sales by Period</h3>
                <div>Initial Date: ${initialDateValue} - Final Date: ${finalDateValue}</div>
                <div>Sales amount: 10000.00</div>
            </div>
        `;
        return report;
    };

    const employeeSales = {
        id: "employeeSales",
        name: "Employee Sales",
        reportGeneratorHandle: getEmployeeSales,
        reportInputs: [
            {
                id: "name_input",
                component: textInput,
                label: "Employee Name",
            },
        ],
    };

    ReportEngine.addReport(employeeSales);

    const salesReportbyPeriod = {
        id: "salesReportbyPeriod",
        name: "Sales by Period",
        reportGeneratorHandle: getSalesReportbyPeriod,
        reportInputs: [
            {
                id: "initial_date",
                component: datePickerInput,
                label: "Initial Date",
            },
            {
                id: "final_date",
                component: datePickerInput,
                label: "Final Date",
            },
        ],
    };
    ReportEngine.addReport(salesReportbyPeriod);
});
