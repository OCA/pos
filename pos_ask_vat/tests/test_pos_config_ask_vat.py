# Copyright 2022 KMEE (<http://www.kmee.com.br>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests.common import TransactionCase


class TestPosConfigAslVat(TransactionCase):
    def setUp(self):
        super(TestPosConfigAslVat, self).setUp()

        # Create a new pos config and open it
        self.pos_config = self.env.ref("point_of_sale.pos_config_main").copy()

    def test_add_cancel_reason_config_with_reason_registers(self):
        self.pos_config.iface_pos_ask_vat = True
        self.pos_config.pos_ask_vat_question = "no"
        self.assertFalse(self.pos_config.pos_ask_vat_auto_create_partner)
