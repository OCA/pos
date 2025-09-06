from odoo.tests.common import TransactionCase


class TestModuleInstallation(TransactionCase):
    def test_module_installed(self):
        self.assertTrue(
            self.env["ir.module.module"].search([("name", "=", "pos_order_datepicker")])
        )
