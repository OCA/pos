from odoo import fields, models


class ReportPosROrder(models.Model):
    _inherit = "report.pos.order"

    discount = fields.Float(string="Discount %", readonly=True)

    def _select(self):
        return super()._select() + ",l.discount AS discount"

    def _group_by(self):
        return super()._group_by() + ",l.discount"
