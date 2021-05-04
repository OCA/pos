import odoo.tests


@odoo.tests.tagged('pos_install', '-at-install')
class TestUi(odoo.tests.HttpCase):

    def test_01_pos_container_tour(self):
        self.phantom_js(
            "/web",
            "odoo.__DEBUG__.services['web_tour.tour']" +
            ".run('pos_container_tour')",
            "odoo.__DEBUG__.services['web_tour.tour']" +
            ".tours.pos_container_tour.ready",
            login="admin")
