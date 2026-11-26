from odoo import fields, models


class PosPaymentMethod(models.Model):
    _inherit = "pos.payment.method"

    change_account_id = fields.Many2one(
        comodel_name="account.account",
        string="Cash Receipt Account",
        check_company=True,
        help="Intermediate account where cash from customers is initially received. "
        "Cash will be transferred from this account to the journal's cash account. "
        "This allows separate tracking of cash receipts before they reach the main "
        "cash register.",
    )
