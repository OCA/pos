# Copyright (C) 2022-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html


from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestUi(TestPointOfSaleHttpCommon):
    def test_pos_customer_comment(self):
        self.main_pos_config.open_ui()
        self.main_pos_config.current_session_id.set_cashbox_pos(0, None)

        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "PosCustomerCommentTour",
            login="accountman",
        )
        customer = self.env.ref("base.res_partner_address_31")
        self.assertEqual(customer.pos_comment, "New Comment")
