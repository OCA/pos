from odoo.tests import HttpCase, tagged


@tagged("post_install", "-at_install")
class TestCustomerScreen(HttpCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(context=dict(cls.env.context, tracking_disable=True))
        cls.partner = cls.env["res.partner"].create({"name": "Test Partner"})
        cls.pos_config = cls.env["pos.config"].create({"name": "Test Config"})

    def test_customer_screen_location(self):
        self.authenticate("admin", "admin")

        resp_invalid = self.url_open(
            f"/customer_screen_location/0/{self.pos_config.id}/"
        )
        self.assertFalse(resp_invalid.ok, "Response must not be OK")
        self.assertEqual(
            resp_invalid.status_code, 400, "Response status code must be equal to 400"
        )

        resp_invalid = self.url_open(f"/customer_screen_location/{self.partner.id}/0/")
        self.assertFalse(resp_invalid.ok, "Response must not be OK")
        self.assertEqual(
            resp_invalid.status_code, 400, "Response status code must be equal to 400"
        )

        resp_invalid = self.url_open("/customer_screen_location/0/0/")
        self.assertFalse(resp_invalid.ok, "Response must not be OK")
        self.assertEqual(
            resp_invalid.status_code, 400, "Response status code must be equal to 400"
        )

        response = self.url_open(
            f"/customer_screen_location/{self.partner.id}/{self.pos_config.id}/"
        )
        self.assertTrue(response.ok, "Response must be OK")
        self.assertEqual(
            response.status_code, 200, "Response status code must be equal to 200"
        )
