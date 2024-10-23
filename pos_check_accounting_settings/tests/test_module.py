# Copyright (C) 2024 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.exceptions import UserError
from odoo.tests.common import TransactionCase


class TestModule(TransactionCase):
    def setUp(self):
        super().setUp()
        self.pos_config = self.env.ref("point_of_sale.pos_config_main").copy(
            default={
                "payment_method_ids": self.env.ref(
                    "point_of_sale.pos_config_main"
                ).payment_method_ids.ids
            }
        )
        self.bank_payment_method = self.pos_config.payment_method_ids.filtered(
            lambda x: x.journal_id.type == "bank" and not x.split_transactions
        )

    def test_correct_configuration(self):
        self.pos_config.open_ui()

    def test_incorrect_configuration(self):
        self.bank_payment_method.outstanding_account_id = False
        self.env.company.account_journal_payment_debit_account_id = False
        with self.assertRaises(UserError):
            self.pos_config.open_ui()
