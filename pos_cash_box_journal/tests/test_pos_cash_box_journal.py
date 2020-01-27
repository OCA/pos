# Copyright 2020 Creu Blanca
# Copyright 2020 ForgeFlow, S.L.
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl.html).

from odoo.tests.common import TransactionCase


class TestPosCashBoxJournal(TransactionCase):
    def setUp(self):
        super(TestPosCashBoxJournal, self).setUp()
        self.pos_config = self.env["pos.config"].create({"name": "PoS config"})
        bank_journal = self.env["account.journal"].create({
            "name": "Test bank",
            "code": "TB1",
            "type": "bank",
        })
        self.pos_config.journal_ids += bank_journal
        self.pos_config.open_session_cb()
        self.session = self.pos_config.current_session_id
        self.session.action_pos_session_open()

    def test_wizard(self):
        journal = self.session.journal_ids.filtered(lambda j: j.code == 'TB1')
        wizard = (
            self.env["cash.box.journal.in"]
            .with_context(
                active_model="pos.session", active_ids=self.session.ids
            )
            .create({"amount": 10, "name": "Out"})
        )
        wizard.journal_id = journal
        wizard.run()
        self.assertGreater(
            self.session.statement_ids.filtered(
                lambda r: r.journal_id.id == journal.id
            ).balance_end,
            0,
        )
        wizard = (
            self.env["cash.box.journal.out"]
            .with_context(
                active_model="pos.session", active_ids=self.session.ids
            )
            .create({"amount": 10, "name": "Out"})
        )
        wizard.journal_id = journal
        wizard.run()
        self.assertEqual(
            self.session.statement_ids.filtered(
                lambda r: r.journal_id.id == journal.id
            ).balance_end,
            0,
        )
