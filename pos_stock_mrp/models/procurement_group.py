# Part of Odoo. See LICENSE file for full copyright and licensing details.
from odoo import fields, models


class ProcurementGroup(models.Model):
    _inherit = "procurement.group"

    pos_order_id = fields.Many2one("pos.order", "Pos Order")
