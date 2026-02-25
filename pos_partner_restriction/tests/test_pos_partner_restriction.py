# Copyright 2026 Therp BV <https://therp.nl>.
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
from odoo.tests.common import tagged

from odoo.addons.point_of_sale.tests.common import TestPointOfSaleCommon


@tagged("post_install", "-at_install")
class TestPosPartnerRestriction(TestPointOfSaleCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.partner_allowed = cls.env["res.partner"].create(
            {
                "name": "POS Allowed",
                "pos_pay_on_account": True,
            }
        )
        cls.partner_blocked = cls.env["res.partner"].create(
            {
                "name": "POS Blocked",
                "pos_pay_on_account": False,
            }
        )

    def _open_session(self):
        self.pos_config.open_ui()
        return self.pos_config.current_session_id

    def test_pos_partner_loading_is_restricted(self):
        """Only partners with pos_pay_on_account=True should be loaded"""
        session = self._open_session()
        params = session._loader_params_res_partner()
        partners = session._get_pos_ui_res_partner(params)
        loaded_ids = {p["id"] for p in partners}
        self.assertIn(self.partner_allowed.id, loaded_ids)
        self.assertNotIn(self.partner_blocked.id, loaded_ids)

    def test_pos_partner_search_more_filter(self):
        session = self._open_session()
        partners = session.get_pos_ui_res_partner_by_params(
            {
                "domain": [
                    ("id", "in", [self.partner_allowed.id, self.partner_blocked.id])
                ],
                "fields": ["id", "name", "pos_pay_on_account"],
            }
        )
        loaded_ids = {p["id"] for p in partners}
        self.assertIn(self.partner_allowed.id, loaded_ids)
        self.assertNotIn(self.partner_blocked.id, loaded_ids)
