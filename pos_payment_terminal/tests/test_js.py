import odoo.tests


@odoo.tests.tagged("post_install", "-at_install")
class WebSuite(odoo.tests.HttpCase):
    def setUp(self):
        super().setUp()
        env = self.env(user=self.env.ref("base.user_admin"))
        self.main_pos_config = env.ref("point_of_sale.pos_config_main")

    def test_js(self):
        self.main_pos_config.open_session_cb(check_coa=False)
        self.browser_js(
            "/pos/ui/tests?mod=pos_payment_terminal&failfast",
            "",
            "",
            login="admin",
            timeout=1800,
        )
