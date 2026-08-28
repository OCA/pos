# Copyright 2025 Ángel Rivas <angel.rivas@sygel.es>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).


from odoo.tests.common import TransactionCase


class TestPosEarlyReceiptPrinting(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.pos_config = cls.env.ref("point_of_sale.pos_config_main").copy(
            {
                "name": "Test POS Early Receipt",
                "module_pos_restaurant": False,
                "iface_printbill": True,
                "iface_splitbill": True,
            }
        )

    def test_printbill_enabled_without_restaurant(self):
        settings = self.env["res.config.settings"].create(
            {
                "pos_config_id": self.pos_config.id,
                "pos_module_pos_restaurant": False,
            }
        )
        settings._compute_pos_module_pos_restaurant()
        self.assertTrue(settings.pos_iface_printbill)
        self.assertFalse(settings.pos_iface_splitbill)

    def test_printbill_disabled_without_restaurant_when_not_enabled_on_pos(self):
        self.pos_config.iface_printbill = False
        settings = self.env["res.config.settings"].create(
            {
                "pos_config_id": self.pos_config.id,
                "pos_module_pos_restaurant": False,
            }
        )
        settings._compute_pos_module_pos_restaurant()
        self.assertFalse(settings.pos_iface_printbill)
        self.assertFalse(settings.pos_iface_splitbill)
