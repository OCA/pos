# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)

from odoo import api, models


class ReportSaleDetails(models.AbstractModel):
    _inherit = "report.point_of_sale.report_saledetails"

    @api.model
    def get_sale_details(
        self, date_start=False, date_stop=False, config_ids=False, session_ids=False
    ):
        report_vals = super().get_sale_details(
            date_start=date_start,
            date_stop=date_stop,
            config_ids=config_ids,
            session_ids=session_ids,
        )
        if config_ids:
            sales_report_by_category_only = any(
                self.env["pos.config"]
                .search([("id", "in", config_ids)])
                .mapped("sales_report_by_category_only")
            )
        else:
            sales_report_by_category_only = any(
                self.env["pos.session"]
                .search([("id", "in", session_ids)])
                .mapped("config_id.sales_report_by_category_only")
            )
        report_vals["sales_report_by_category_only"] = sales_report_by_category_only
        return report_vals
