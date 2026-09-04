import logging

from odoo import fields, models

_logger = logging.getLogger(__name__)


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_partner_category = fields.Boolean(
        related="pos_config_id.pos_partner_category",
        readonly=False,
        string="Filter partner from category (PoS)",
    )
    pos_partner_category_id = fields.Many2one(
        related="pos_config_id.partner_category_id",
        readonly=False,
        string="Partner Category (PoS)",
    )
