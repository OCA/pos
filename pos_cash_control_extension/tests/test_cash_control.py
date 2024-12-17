# Copyright 2024 Antoni Marroig(APSL-Nagarro)<amarroig@apsl.net>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tests.common import TransactionCase


class SomethingCase(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.config_id = cls.env.ref("point_of_sale.pos_config_main")
        cls.session_id = cls.env["pos.session"].create(
            {
                "config_id": cls.config_id.id,
                "user_id": cls.env.ref("base.user_admin").id,
            }
        )
        cls.session_id.set_cashbox_pos(150.0, "")
        cls.session_id.try_cash_in_out("in", 20.0, "In", {"translatedType": "in"})

    def test_pos_session_closing_control(self):
        self.session_id.action_pos_session_closing_control(False, 170.0, None)
        self.assertEqual(
            self.session_id.get_closing_control_data()["default_cash_details"][
                "amount"
            ],
            170.0,
        )
        self.assertEqual(
            self.session_id.get_closing_control_data()["default_cash_details"][
                "opening"
            ],
            150.0,
        )
        self.session_id.post_closing_cash_details(170.0)
        self.assertEqual(self.session_id.cash_register_balance_end_real, 150.0)
        self.assertEqual(self.session_id.cash_register_balance_start, 150.0)
