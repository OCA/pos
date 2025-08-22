# copyright 2022 FactorLibre
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import odoo

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestPosDefaultPartner(TestPoSCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        if not cls.env.company.chart_template_id:
            # Load a CoA if there's none in current company
            coa = cls.env.ref("l10n_generic_coa.configurable_chart_template", False)
            if not coa:
                # Load the first available CoA
                coa = cls.env["account.chart.template"].search(
                    [("visible", "=", True)], limit=1
                )
            coa.try_loading(company=cls.env.company, install_demo=False)
        cls.config = cls.basic_config
        cls.PosOrder = cls.env["pos.order"]
        # ==== Partners ====
        cls.partner_01 = cls.env["res.partner"].create({"name": "Test partner 1"})
        cls.partner_02 = cls.env["res.partner"].create({"name": "Test partner 2"})
        cls.partner_03 = cls.env["res.partner"].create({"name": "Test partner 3"})
        # ==== Products ====
        cls.product0 = cls.create_product("Product test 0", cls.categ_basic, 5.0, 0.0)
        cls.product1 = cls.create_product("Product test 1", cls.categ_basic, 10.0, 5)

    def _create_order(self, partner_id=False, is_invoiced=False):
        # ==== create order ====
        orders = [
            self.create_ui_order_data(
                [(self.product0, 3), (self.product1, 20)],
                customer=partner_id,
                is_invoiced=is_invoiced,
            )
        ]
        result = self.env["pos.order"].create_from_ui(orders)
        order = self.PosOrder.browse(result[0]["id"])
        return order

    def test_no_default_partner(self):
        self.open_new_session()
        order = self._create_order()
        self.assertTrue(order)
        self.assertFalse(order.partner_id)

    def test_no_default_partner_assigned_partner(self):
        self.open_new_session()
        order = self._create_order(self.partner_01)
        self.assertTrue(order)
        self.assertEqual(order.partner_id, self.partner_01)

    def test_default_partner(self):
        self.open_new_session()
        self.config.default_partner_id = self.partner_02
        order = self._create_order()
        self.assertTrue(order)
        self.assertEqual(order.partner_id, self.partner_02)

    def test_default_partner_assigned_partner(self):
        self.open_new_session()
        self.config.default_partner_id = self.partner_02
        order = self._create_order(self.partner_01)
        self.assertTrue(order)
        self.assertEqual(order.partner_id, self.partner_01)

    def test_pos_move_default_partner(self):
        self.open_new_session()
        self.config.default_partner_id = self.partner_02
        session = self.config.current_session_id
        order = self._create_order()
        self.assertTrue(order)
        self.assertEqual(order.partner_id, self.partner_02)
        session.action_pos_session_closing_control()
        related_moves = session._get_related_account_moves()
        moves_partner = related_moves.line_ids.mapped("partner_id")
        self.assertEqual(moves_partner, self.partner_02)

    def test_pos_move_default_partner_invoiced_order(self):
        self.open_new_session()
        self.config.default_partner_id = self.partner_02
        session = self.config.current_session_id
        order = self._create_order()
        self.assertTrue(order)
        self.assertEqual(order.partner_id, self.partner_02)
        order2 = self._create_order(partner_id=self.partner_03, is_invoiced=True)
        self.assertTrue(order2)
        self.assertEqual(order2.partner_id, self.partner_03)
        session.action_pos_session_closing_control()
        related_moves = session._get_related_account_moves()
        moves_partner = related_moves.line_ids.mapped("partner_id")
        self.assertIn(self.partner_02, moves_partner)
        self.assertIn(self.partner_03, moves_partner)
