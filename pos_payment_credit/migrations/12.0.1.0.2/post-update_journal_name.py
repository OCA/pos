from odoo import api, SUPERUSER_ID


def migrate(cr, version):
    """
    ADD `credit` to the payment methods of all point of sale
    """
    with api.Environment.manage():
        env = api.Environment(cr, SUPERUSER_ID, {})
        credit_journal = env.ref('pos_payment_credit.credit_journal', False)
        if credit_journal:
            credit_journal.name = 'Avoir'
