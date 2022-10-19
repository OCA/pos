odoo.define("pos_report_sale_details.saleDetailsReport", function (require) {
    "use strict";

    const ReportEngine = require("pos_report_engine.ReportEngine");

    const onClick = async function (context) {
        // IMPROVEMENT: Perhaps put this logic in a parent component
        // so that for unit testing, we can check if this simple
        // component correctly triggers an event.
        const env = context.env;
        const saleDetails = await context.env.services.rpc({
            model: "report.point_of_sale.report_saledetails",
            method: "get_sale_details",
            args: [false, false, false, [env.pos.pos_session.id]],
        });
        const report = env.qweb.renderToString(
            "SaleDetailsReport",
            Object.assign({}, saleDetails, {
                date: new Date().toLocaleString(),
                pos: env.pos,
            })
        );

        return report;
    };

    const saleDetailsReport = {
        id: "saleDetailsReport",
        name: "Sale Details",
        reportGeneratorHandle: onClick,
    };
    ReportEngine.addReport(saleDetailsReport);
});
