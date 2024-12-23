# Copyright 2024 Antoni Marroig(APSL-Nagarro)<amarroig@apsl.net>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tests.common import TransactionCase


class TestPosSessionSequence(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.pos_config_id = cls.env.ref("point_of_sale.pos_config_main")
        cls.sequence_id = cls.env.ref("pos_session_sequence.pos_session_seq")

    def test_session_sequence(self):
        self.session_id = self.env["pos.session"].create(
            [
                {
                    "config_id": self.pos_config_id.id,
                    "user_id": self.env.ref("base.user_admin").id,
                }
            ]
        )
        self.sequence_id.number_next_actual -= 1
        self.assertEqual(self.session_id.name, self.sequence_id._next())
