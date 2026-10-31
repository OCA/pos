# Copyright 2026 INVITU (<https://www.invitu.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class ProductAttribute(models.Model):
    _inherit = "product.attribute"

    pos_hide_on_receipt = fields.Boolean(string="Hide on Receipt")
    pos_hide_on_kitchen_ticket = fields.Boolean(string="Hide on Kitchen Ticket")

    @api.model
    def _load_pos_data_fields(self, config_id):
        return super()._load_pos_data_fields(config_id) + [
            "pos_hide_on_receipt",
            "pos_hide_on_kitchen_ticket",
        ]
