# Copyright (C) 2022-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from odoo import fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    pos_comment = fields.Text(
        string="Cashier Comment",
        help="Comment that will be visible and editable in the"
        " Point of Sale for the  cashiers",
    )
