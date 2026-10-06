# Copyright (C) 2022-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html


from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestPosSalePickingKeep(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.pos_user.groups_id += cls.env.ref("base.group_system")

    def test_pos_customer_comment(self):
        self.main_pos_config.with_user(self.pos_user).open_ui()
        session = self.main_pos_config.current_session_id
        if session.state != "opened":
            session.action_pos_session_open()
        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "PosCustomerCommentTour",
            login="pos_user",
        )
        customer = self.env.ref("base.res_partner_address_31")
        self.assertEqual(customer.pos_comment, "New Comment")
