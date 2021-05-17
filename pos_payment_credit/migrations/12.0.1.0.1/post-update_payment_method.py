from odoo import api, SUPERUSER_ID


def migrate(cr, version):
    """
    ADD `credit` to the payment methods of all point of sale
    """
    with api.Environment.manage():
        env = api.Environment(cr, SUPERUSER_ID, {})
        credit_journal = env.ref('pos_payment_credit.credit_journal', False)
        pos_configs = env['pos.config'].search([])
        if credit_journal and pos_configs:
            # because of the stupid `_check_company_payment` constraint does
            # not support multi-records.
            for rec in pos_configs:
                rec.write({
                    'journal_ids': [(4, credit_journal.id)]
                })
        cr.execute("UPDATE account_journal SET sequence=10 WHERE sequence ISNULL")
