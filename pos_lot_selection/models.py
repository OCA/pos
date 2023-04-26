from odoo import _, api, fields, models

class PosConfig(models.Model):
    _inherit = "pos.config"

    default_location_src_id = fields.Many2one(
        "stock.location", related="picking_type_id.default_location_src_id"
    )