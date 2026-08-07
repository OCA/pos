# Copyright 2024 Antoni Marroig(APSL-Nagarro)<amarroig@apsl.net>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.addons.base.tests.common import BaseCommon


class TestPosSessionSequence(BaseCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.custom_sequence_1 = cls.env["ir.sequence"].create(
            {
                "name": "Sequence for POS Sessions 1",
                "prefix": "SHOP-A-",
                "padding": 3,
            }
        )
        cls.custom_sequence_2 = cls.env["ir.sequence"].create(
            {
                "name": "Sequence for POS Sessions 2",
                "prefix": "SHOP-B-",
                "padding": 3,
            }
        )
        cls.pos_config_1 = cls.env["pos.config"].create(
            {
                "name": "Punto de Venta Test 1",
                "session_sequence_id": cls.custom_sequence_1.id,
            }
        )
        cls.pos_config_2 = cls.env["pos.config"].create(
            {
                "name": "Punto de Venta Test 2",
                "session_sequence_id": cls.custom_sequence_2.id,
            }
        )

    def test_01_session_custom_sequence(self):
        session = self.env["pos.session"].create(
            {
                "config_id": self.pos_config_1.id,
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
                "config_id": self.pos_config_1.id,
            }
        )
        session_2.set_opening_control(0.0, "")
        self.assertEqual(session_2.name, "SHOP-A-002")

    def test_02_session_rescue_no_sequence(self):
        session_rescue = self.env["pos.session"].create(
            {
                "config_id": self.pos_config_1.id,
                "rescue": True,
            }
        )
        session_rescue.set_opening_control(0.0, "")
        self.assertNotEqual(session_rescue.name, "SHOP-A-003")

    def test_03_session_rescue_with_sequence(self):
        session = self.env["pos.session"].create(
            {
                "config_id": self.pos_config_2.id,
            }
        )
        session.set_opening_control(0.0, "")
        self.assertNotEqual(session.name, "SHOP-A-004")
        session.action_pos_session_open()
        session.action_pos_session_closing_control()
        session = self.env["pos.session"].create(
            {
                "config_id": self.pos_config_2.id,
            }
        )
        session.set_opening_control(0.0, "Initial cash")
        self.assertEqual(session.name, "SHOP-B-002")

    def test_04_default_session_sequence(self):
        default_seq = self.env.ref("point_of_sale.seq_pos_session")
        config = self.env["pos.config"].create(
            {
                "name": "Punto de Venta Default Seq",
            }
        )
        self.assertEqual(config.session_sequence_id, default_seq)

    def test_05_res_config_settings(self):
        config_settings = self.env["res.config.settings"].create(
            {
                "pos_config_id": self.pos_config_1.id,
            }
        )
        self.assertEqual(
            config_settings.pos_session_sequence_id,
            self.pos_config_1.session_sequence_id,
        )
