# Copyright 2018-20 ForgeFlow S.L. (https://www.forgeflow.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    pos_adyen_shopper_reference = fields.Char(
        string="PoS Adyen Shopper Reference",
        help="This is a unique reference for this customer in Adyen."
    )
    pos_adyen_payment_token = fields.Char(
        string="PoS Adyen Payment Token",
        help="This is the token used for payment automation with Adyen, 0 means the "
             "client has declined storing information in the system."
    )
    pos_adyen_card_details = fields.Serialized(
        readonly=True
    )
    pos_adyen_payment_token_expiration = fields.Date(
        string="Expiration of PoS Adyen payment Token"
    )

    def cron_clean_adyen_payment_token(self):
        """
            Goes over all users with adyen payment token and removes those that have
            expired
        """
        partners = self.search([
            ("pos_adyen_payment_token", "!=", False),
            ("pos_adyen_payment_token_expiration", "<", fields.Date.today())
        ])
        partners.write({
            "pos_adyen_payment_token": False,
            "pos_adyen_payment_token_expiration": False
        })
