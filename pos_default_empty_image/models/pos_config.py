# Copyright (C) 2020 - Today:
#   GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'

    iface_fixed_font_size = fields.Integer(
        string="Fixed Font Size",
        help="Font size of the product name, when it has no image."
        " Set '0' will set adaptative font-size, depending on the"
        " length of the name.")
