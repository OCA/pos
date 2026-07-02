# Copyright 2024 Antoni Marroig(APSL-Nagarro)<amarroig@apsl.net>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.addons.base.tests.common import BaseCommon


class TestPosSessionSequence(BaseCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.custom_sequence = cls.env["ir.sequence"].create(
            {
                "name": "Sequence for POS Sessions",
                "prefix": "SHOP-A-",
                "padding": 3,
            }
        )
        cls.pos_config = cls.env["pos.config"].create(
            {
                "name": "Punto de Venta Test",
                "session_sequence_id": cls.custom_sequence.id,
            }
        )

    def test_01_session_custom_sequence(self):
        session = self.env["pos.session"].create(
            {
                "config_id": self.pos_config.id,
                "user_id": self.env.uid,
            }
        )
        self.assertEqual(session.state, "opening_control")
        session.set_opening_control(100.0, "Initial cash")
        self.assertEqual(session.name, "SHOP-A-001")
        session.action_pos_session_open()
        session.action_pos_session_closing_control()
        session_2 = self.env["pos.session"].create(
            {
                "config_id": self.pos_config.id,
            }
        )
        session_2.set_opening_control(0.0, "")
        self.assertEqual(session_2.name, "SHOP-A-002")

    def test_02_session_rescue_no_sequence(self):
        session_rescue = self.env["pos.session"].create(
            {
                "config_id": self.pos_config.id,
                "rescue": True,
            }
        )
        session_rescue.set_opening_control(0.0, "")
        self.assertNotEqual(session_rescue.name, "SHOP-A-003")
