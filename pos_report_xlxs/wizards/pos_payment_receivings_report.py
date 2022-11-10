# Copyright 2022 KMEE
# License LGPL-3 or later (https://www.gnu.org/licenses/lgpl).
import logging

from odoo import _, models

_logger = logging.getLogger(__name__)


class PosPaymentReceivingsReportXlxs(models.TransientModel):
    _name = "pos.payment.receivings.report.xlxs.wizard"
    _inherit = ["pos.report.xlxs.mixin"]

    def get_titles(self):
        return [
            _("Payment Type"),
            _("Total"),
            _("% From Total"),
            _("Quantity"),
            _("Average"),
        ]

    def get_sql(self):
        return f"""
            SELECT ppm.name,
            SUM(pp.amount) as total_paid,
            SUM(pp.amount)/SUM(SUM(pp.amount)) over (),
            count(pp.id),
            SUM(pp.amount)/count(pp.id)
            FROM pos_payment pp
            LEFT JOIN pos_order po ON po.id = pp.pos_order_id
            LEFT JOIN pos_payment_method ppm ON ppm.id = pp.payment_method_id
            WHERE po.id IN (SELECT id FROM pos_order where session_id IN (
            SELECT id FROM pos_session WHERE start_at >= '{self.date_start} 00:00:00'
            AND stop_at <= '{self.date_end} 23:59:59') AND state = 'paid' OR state = 'done')
            group by ppm.name
            order by total_paid desc
        """

    def get_data(self):
        sql = self.get_sql()
        self.env.cr.execute(sql)
        data = self.env.cr.fetchall()

        return data

    def generate_report(self):
        titles = self.get_titles()
        data = self.get_data()
        self.generate_xlxs_report(
            file_name="pos_payment_receivings",
            sheet_name="Payment Receivings",
            titles=titles,
            data=data,
        )

        form, this = self.get_form_data(
            "pos_report_xlxs", "view_pos_payment_receivings_report_wizard"
        )

        return {
            "type": "ir.actions.act_window",
            "res_model": "pos.payment.receivings.report.xlxs.wizard",
            "view_mode": "form",
            "view_type": "form",
            "res_id": this.id,
            "views": [(form[1], "form")],
            "target": "new",
        }
