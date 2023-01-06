# Copyright 2022 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, models


class PosOrderItemsSalesReportXlxsWizard(models.TransientModel):

    _name = "pos.order.items.sales.report.xlxs.wizard"
    _inherit = ["pos.report.xlxs.mixin"]

    def get_titles(self):
        return [
            _("Order Reference"),
            _("Reference Code"),
            _("Product"),
            _("Category"),
            _("Quantity"),
            _("Price Gross"),
            _("Discount"),
            _("Amount Total"),
        ]

    def get_sql(self):
        return f"""
            SELECT po.name, pp.default_code, pol.full_product_name,
            pc.name, pol.qty, pol.price_unit,
            (pol.price_unit * (pol.discount / 100)) AS discount,
            (pol.qty * pol.price_unit) * (100 - pol.discount) / 100 AS venda_liquida
            FROM pos_order_line pol
            LEFT JOIN pos_order po ON po.id = pol.order_id
            LEFT JOIN product_product pp ON pp.id = pol.product_id
            LEFT JOIN product_template pt ON pt.id = pp.product_tmpl_id
            LEFT JOIN pos_category pc ON pc.id = pt.pos_categ_id
            WHERE po.id IN (SELECT id FROM pos_order WHERE session_id IN (
            SELECT id FROM pos_session WHERE start_at >= '{self.date_start} 00:00:00'
            AND start_at <= '{self.date_end} 23:59:59') AND state IN ('paid', 'done')
            AND amount_total >= 0 AND company_id = {self.company_id.id})
            ORDER BY po.name;
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
            file_name="pos_order_items_sales",
            sheet_name="Order Items Sales",
            titles=titles,
            data=data,
        )

        form, this = self.get_form_data(
            "pos_report_xlxs", "pos_order_items_sales_report_xlxs_wizard_form_view"
        )

        return {
            "type": "ir.actions.act_window",
            "res_model": "pos.order.items.sales.report.xlxs.wizard",
            "view_mode": "form",
            "view_type": "form",
            "res_id": this.id,
            "views": [(form[1], "form")],
            "target": "new",
        }
