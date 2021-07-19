from odoo import fields, models


class PosOrderReport(models.Model):
    _inherit = "report.pos.order"

    margin_total = fields.Float(string="Margin Total")
    margin_rate = fields.Float(string="Margin Rate", group_operator="avg")

    def _select(self):
        return (
            super(PosOrderReport, self)._select()
            + """,
    SUM(l.margin) as margin_total,
    (SUM(l.margin / nullif(l.qty,0)) * 100 /
    SUM(nullif(l.purchase_price,0)))::decimal as margin_rate
    """
        )
