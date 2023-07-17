# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosOrderReport(models.Model):
    _inherit = "report.pos.order"

    margin_rate = fields.Float(string="Margin Rate (%)", group_operator="avg")

    def _select(self):
        return (
            super(PosOrderReport, self)._select()
            + """,
             SUM(l.price_subtotal - l.total_cost / CASE COALESCE(s.currency_rate, 0)
             WHEN 0 THEN 1.0 ELSE s.currency_rate END) / NULLIF(SUM(l.price_subtotal), 0) * 100
             AS margin_rate
            """
        )

    def _group_by(self):
        group_by_append = """,
            l.price_subtotal,
            l.total_cost
        """
        return super(PosOrderReport, self)._group_by() + group_by_append
