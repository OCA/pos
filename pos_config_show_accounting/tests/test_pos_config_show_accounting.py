# Copyright 2018 Eficent Business and IT Consulting Services, S.L.
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl.html).

from odoo.tests.common import TransactionCase


class TestPosConfigShowAccounting(TransactionCase):
    def setUp(self):
        super(TestPosConfigShowAccounting, self).setUp()

    def test_show_accounting(self):
        pos_config = self.env['pos.config'].create(
            {'name': 'PoS config show accounting'})
        self.assertEquals(pos_config.is_installed_account_accountant, True)
