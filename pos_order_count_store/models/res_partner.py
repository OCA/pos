from odoo import api, fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    pos_order_count = fields.Integer(store=True)
    pos_order_ids = fields.One2many(comodel_name="pos.order", inverse_name="partner_id")

    @api.depends("pos_order_ids", "pos_order_ids.partner_id")
    def _compute_pos_order(self):
        super()._compute_pos_order()
