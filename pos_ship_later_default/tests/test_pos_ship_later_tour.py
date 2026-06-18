import odoo.tests

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestPosShipLaterTour(TestPointOfSaleHttpCommon):
    def test_pos_ship_later_tour(self):
        # Create a partner with address
        self.env["res.partner"].create(
            {
                "name": "Partner Test with Address",
                "street": "test street",
                "zip": "1234",
                "city": "test city",
                "country_id": self.env.ref("base.us").id,
            }
        )
        # Configure POS with ship later default settings
        self.main_pos_config.write(
            {
                "ship_later": True,
                "ship_later_default": True,
                "ship_later_delivery_delay": 5,
                "hide_ship_later_button": True,
            }
        )
        # Open UI
        self.main_pos_config.with_user(self.pos_user).open_ui()
        # Run tour
        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "pos_ship_later_default_tour",
            login="pos_user",
        )
