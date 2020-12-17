# Copyright 2018-20 ForgeFlow S.L. (https://www.forgeflow.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    pos_payment_token = fields.Char(
        string="PoS Payment Token",
        help="This is the token used for payment automation with Adyen, 0 means the "
             "client has declined storing information in the system."
    )
