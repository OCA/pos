from odoo.tests import HttpCase, tagged


@tagged("post_install", "-at_install")
class TestLoadUI(HttpCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        env = cls.env(user=cls.env.ref("base.user_admin"))
        cls.main_pos_config = env["pos.config"].create(
            {"name": "Test access right", "module_pos_hr": True}
        )

    def test_pos_js(self):
        self.main_pos_config.open_ui()
        self.browser_js("/pos/ui/tests?mod=web", "", "", login="admin", timeout=1800)
