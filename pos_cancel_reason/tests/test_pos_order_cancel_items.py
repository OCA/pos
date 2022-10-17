# Copyright 2022 KMEE (<http://www.kmee.com.br>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.exceptions import ValidationError
from odoo.tests.common import TransactionCase


class TestCancelReasonConfig(TransactionCase):
    def setUp(self):
        super(TestCancelReasonConfig, self).setUp()

        # Create a new pos config and open it
        self.pos_config = self.env.ref("point_of_sale.pos_config_main").copy()

    def test_add_cancel_reason_config_without_reason_registers(self):
        for cancel_reason in self.env["pos.cancel.reason"].search([]):
            cancel_reason.active = False
        with self.assertRaises(ValidationError) as e, self.env.cr.savepoint():
            self.pos_config.reason_to_cancel = True

        self.assertTrue(
            "You can't set reasons to cancel in POS without any reason created!",
            e.exception.args[0],
        )

    def test_add_cancel_reason_config_with_reason_registers(self):
        self.env["pos.cancel.reason"].create({"name": "Reason 1", "active": True})
        self.pos_config.reason_to_cancel = True
        self.assertTrue(self.pos_config.reason_to_cancel)
