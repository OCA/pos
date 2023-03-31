# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.exceptions import UserError
from odoo.tests.common import TransactionCase


class TestScreenLockPosConfig(TransactionCase):
    def setUp(self):
        super().setUp()

        self.pos_config = self.env["pos.config"].search([], limit=1)

    def test_config_screen_lock_time(self):
        self.pos_config.write(
            {
                "iface_screen_lock": True,
                "iface_screen_lock_warning": True,
                "screen_lock_time": 2,
                "warning_screen_lock_time": 1,
            }
        )

        with self.assertRaises(UserError):
            self.pos_config.write({"screen_lock_time": 0})

        with self.assertRaises(UserError):
            self.pos_config.write({"warning_screen_lock_time": 0})

        with self.assertRaises(UserError):
            self.pos_config.write(
                {
                    "screen_lock_time": 5,
                    "warning_screen_lock_time": 6,
                }
            )
