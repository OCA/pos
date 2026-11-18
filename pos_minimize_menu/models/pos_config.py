# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_important_buttons = fields.Text(
        string="Important Buttons",
        help="Set technical names of buttons that will"
        " be displayed in the main point of sale screen."
        " Other buttons will be available by clicking"
        " on the button 'More...'.",
    )
