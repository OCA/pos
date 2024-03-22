from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestPosUI(TestPointOfSaleHttpCommon):
    def test_pos_partner_lang_lng(self):
        partner = self.env["res.partner"].create({"name": "Test Partner"})
        self.assertFalse(partner.partner_latitude, "Partner Latitude must be False")
        self.assertFalse(partner.partner_longitude, "Partner Longitude must be False")
        self.main_pos_config.open_ui()

        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "PartnerDetailTour",
            login="accountman",
        )
        self.assertEqual(
            partner.partner_latitude, 15.0, "Partner Latitude must be equal to 15.0"
        )
        self.assertFalse(partner.partner_longitude, "Partner Longitude must be False")
