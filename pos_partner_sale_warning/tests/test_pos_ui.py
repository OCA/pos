# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestUi(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(context=dict(cls.env.context, tracking_disable=True))
        cls.partner1 = cls.env["res.partner"].create(
            {
                "name": "Test Partner #1",
                "sale_warn": "block",
                "sale_warn_msg": "Error Message Test Message",
            }
        )
        cls.partner2 = cls.env["res.partner"].create(
            {
                "name": "Test Partner #2",
                "sale_warn": "warning",
                "sale_warn_msg": "Warning Message Test Message",
            }
        )

    def test_pos_partner_sale_warning(self):
        """Module behavior test"""
        self.env.user.groups_id += self.env.ref("sale.group_warning_sale")
        self.main_pos_config.open_ui()
        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "PosPartnerSaleWarning",
            login="accountman",
        )
