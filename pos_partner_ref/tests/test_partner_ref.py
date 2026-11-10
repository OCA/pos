# Copyright 2026 ACSONE SA/NV (https://acsonE.u)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("-at_install", "post_install")
class TestPartnerRef(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # cls.main_pos_config = cls.env['pos.config'].create({
        #     'name': 'Shop',
        #     'module_pos_restaurant': False,
        # })
        cls.pos_user.groups_id += cls.env.ref("base.group_system")

    def _get_url(self, pos_config=None):
        pos_config = pos_config or self.main_pos_config
        return f"/pos/ui?config_id={pos_config.id}"

    def start_pos_tour(self, tour_name, login="pos_user", **kwargs):
        self.start_tour(
            self._get_url(pos_config=kwargs.get("pos_config")),
            tour_name,
            login=login,
            **kwargs,
        )

    def test_partner_ref(self):
        self.main_pos_config.with_user(self.pos_user).open_ui()

        # needed because tests are run before the module is marked as
        # installed. In js web will only load qweb coming from modules
        # that are returned by the backend in module_boot. Without
        # this you end up with js, css but no qweb.
        self.env["ir.module.module"].search(
            [("name", "=", "point_of_sale")], limit=1
        ).state = "installed"

        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "PartnerRef",
            login="pos_user",
        )
        # self.start_pos_tour("pos_partner_ref")
