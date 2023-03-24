# Copyright 2022 KMEE - Luis Felipe Mileo <mileo@kmee.com.br>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_crm_question = fields.Selection(
        related="pos_config_id.pos_crm_question",
        readonly=False,
    )
    pos_crm_auto_create_partner = fields.Boolean(
        related="pos_config_id.pos_crm_auto_create_partner",
        readonly=False,
    )
