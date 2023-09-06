from odoo.tests import HttpCase, tagged


@tagged("post_install", "-at_install")
class TestPosPricelistShowDiscount(HttpCase):
    def setUp(self):
        super().setUp()
        self.main_pos_config = self.env.ref("point_of_sale.pos_config_main")

    def test_pos_discount_ref_pricelist(self):
        # open a session, the /pos/ui controller will redirect to it
        self.main_pos_config.open_session_cb(check_coa=False)

        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "test_pos_discount_ref_pricelist",
            login="admin",
        )
