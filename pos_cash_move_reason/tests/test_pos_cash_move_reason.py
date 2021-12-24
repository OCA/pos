# © 2015 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests import common


class TestPosCashMoveReason(common.TransactionCase):

    def setUp(self):
        super(TestPosCashMoveReason, self).setUp()
        self.PosSession = self.env['pos.session']
        self.WizardReason = self.env['wizard.pos.move.reason']
        self.AccountMoveLine = self.env['account.move.line']

        self.config = self.env.ref('point_of_sale.pos_config_main').copy()
        self.cash_journal = self.env['account.journal'].search([
            ('type', '=', 'cash'),
            ('company_id', '=', self.env.ref('base.main_company').id),
        ])[0]
        self.deposit_reason = self.env.ref(
            'pos_cash_move_reason.bank_out_reason')

    def test_take_money(self):
        # Open New Session
        self.config.open_session_cb()
        session = self.PosSession.search([
            ('state', '=', 'opened'),
            ('config_id', '=', self.config.id),
        ])

        self.assertEquals(session.move_reason_statement_line_qty, 0)

        # Get Cash Statement
        statement = session.statement_ids.filtered(
            lambda x: x.journal_id == self.cash_journal)

        # Take money to put in Bank
        wizard = self.WizardReason.with_context(
            active_id=session.id,
            default_move_type='expense').create({
                'move_reason_id': self.deposit_reason.id,
                'journal_id': self.cash_journal.id,
                'statement_id': statement.id,
                'amount': 500,
                'name': 'Test Bank Deposit',
            })
        wizard.apply()

        self.assertEquals(session.move_reason_statement_line_qty, 1)

        session.action_pos_session_closing_control()

        # I get all move lines of this statement
        move_line = self.env['account.move.line'].search(
            [('account_id', '=', self.deposit_reason.expense_account_id.id),
             ('debit', '=', 500.0),
             ('id', 'in', statement.move_line_ids.ids)])
        # I check the created move line from the cash in
        self.assertEquals(len(move_line.ids), 1)
