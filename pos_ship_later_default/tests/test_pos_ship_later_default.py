from odoo.tests import TransactionCase


class TestPosShipLaterDefault(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.pos_config = cls.env["pos.config"].create(
            {
                "name": "Test POS",
                "ship_later_default": True,
                "ship_later_delivery_delay": 5,
                "hide_ship_later_button": True,
            }
        )

    def test_pos_config_fields(self):
        """Test that the new fields are available and configurable on pos.config"""
        self.assertTrue(self.pos_config.ship_later_default)
        self.assertEqual(self.pos_config.ship_later_delivery_delay, 5)
        self.assertTrue(self.pos_config.hide_ship_later_button)

    def test_res_config_settings(self):
        """Test that the res.config.settings correctly reflect pos.config fields"""
        res_config = self.env["res.config.settings"].create(
            {
                "pos_config_id": self.pos_config.id,
            }
        )
        self.assertTrue(res_config.pos_ship_later_default)
        self.assertEqual(res_config.pos_ship_later_delivery_delay, 5)
        self.assertTrue(res_config.pos_hide_ship_later_button)

        # Change via res.config.settings
        res_config.write({"pos_ship_later_delivery_delay": 2})
        # Res config settings execute writes changes
        res_config.execute()
        self.assertEqual(self.pos_config.ship_later_delivery_delay, 2)
