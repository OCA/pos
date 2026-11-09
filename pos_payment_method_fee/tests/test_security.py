from odoo.exceptions import AccessError
from odoo.tests import new_test_user, tagged

from .common import TestPosPaymentFeeCommon


@tagged("post_install", "-at_install")
class TestPosPaymentFeeSecurity(TestPosPaymentFeeCommon):
    def setUp(self):
        super().setUp()
        self.open_new_session()
        self.rule = self._create_rule(amount=1.0)
        self.order = self._sync_order([(self.bank_pm1, 100.0)])
        self.line = self.order.payment_ids.fee_line_ids

    def test_pos_user_reads_but_cannot_change_fees(self):
        line = self.line.with_user(self.pos_user)
        self.assertEqual(line.fee_amount, 1.0)
        self.assertEqual(self.rule.with_user(self.pos_user).name, "Card fee")
        with self.assertRaises(AccessError):
            line.write({"fee_amount": 0.0})
        with self.assertRaises(AccessError):
            self.rule.with_user(self.pos_user).amount = 0.0

    def test_pos_manager_manages_rules_not_fee_ledger(self):
        self.rule.with_user(self.pos_manager).amount = 2.0
        self.assertEqual(self.rule.amount, 2.0)
        with self.assertRaises(AccessError):
            self.line.with_user(self.pos_manager).write({"fee_amount": 0.0})

    def test_other_company_cannot_see_fees(self):
        other_company = self.company_data_2["company"]
        other_user = new_test_user(
            self.env,
            login="fee_other_company",
            groups="base.group_user,point_of_sale.group_pos_manager",
            company_id=other_company.id,
            company_ids=[(6, 0, other_company.ids)],
        )
        fee_lines = self.env["pos.payment.fee.line"].with_user(other_user)
        rules = self.env["pos.payment.method.fee"].with_user(other_user)
        self.assertFalse(fee_lines.search([("id", "=", self.line.id)]))
        self.assertFalse(rules.search([("id", "=", self.rule.id)]))
