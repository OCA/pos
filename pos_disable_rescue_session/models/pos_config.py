# Copyright 2023 Akretion (http://www.akretion.com).
# @author Florian Mounier <florian.mounier@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    disable_rescue_session = fields.Boolean(
        string="Disable rescue session",
        help="Prevent the creation of a rescue session for remaining orders "
        "when the POS is closed.\n"
        "These orders will be recovered on the next session.",
    )
