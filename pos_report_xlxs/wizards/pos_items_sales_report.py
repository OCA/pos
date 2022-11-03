# Copyright 2022 KMEE
# License LGPL-3 or later (https://www.gnu.org/licenses/lgpl).
import logging

from odoo import _, models

_logger = logging.getLogger(__name__)


class PosItemsSalesReportXlxs(models.TransientModel):
    _name = "pos.items.sales.report.xlxs.wizard"
    _inherit = ["pos.report.xlxs.mixin"]

    def get_titles(self):
        return [
            _("Product"),
            _("Category"),
            _("Quantity"),
            _("Price Gross"),
            _("Discount"),
            _("Amount Total"),
        ]

    def get_sql(self):
        return f"""
            SELECT pt."name", pc."name",
            SUM(pol.qty) as qtde_vendida,
            SUM(pol.qty * pol.price_unit) as venda_bruta,
            SUM(pol.qty * pol.price_unit) - SUM((pol.qty * pol.price_unit) *
            (100 - pol.discount) / 100) as desc_item,
            SUM((pol.qty * pol.price_unit) * (100 - pol.discount) / 100)
            as venda_liquida
            from pos_order_line pol
            left join pos_order po on po.id = pol.order_id
            left join product_product pp on pp.id = pol.product_id
            left join product_template pt on pt.id = pp.product_tmpl_id
            left join pos_category pc on pc.id = pt.pos_categ_id
            WHERE po.id in (SELECT id FROM pos_order where session_id in (
            SELECT id FROM pos_session WHERE start_at >= '{self.date_start}'
            AND start_at <= '{self.date_end}') and state = 'paid')
            group by pt."name", pc."name", pc.id, pol.product_id, pp.default_code
            order by venda_bruta DESC
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
            file_name="pos_items_sales",
            sheet_name="Items Sales",
            titles=titles,
            data=data,
        )

        form, this = self.get_form_data(
            "pos_report_xlxs", "view_pos_items_sales_report_wizard"
        )

        return {
            "type": "ir.actions.act_window",
            "res_model": "pos.items.sales.report.xlxs.wizard",
            "view_mode": "form",
            "view_type": "form",
            "res_id": this.id,
            "views": [(form[1], "form")],
            "target": "new",
        }
