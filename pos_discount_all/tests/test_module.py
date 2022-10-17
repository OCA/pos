# Copyright (C) 2022-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html


from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestUi(TestPointOfSaleHttpCommon):
    def test_pos_discount_all(self):

        pricelist = self.env["product.pricelist"].create(
            {
                "name": "Pricelist -10%",
            }
        )
        self.env["product.pricelist.item"].create(
            {
                "pricelist_id": pricelist.id,
                "name": "Pricelist Item -10%",
                "applied_on": "3_global",
                "compute_price": "percentage",
                "percent_price": 10,
            }
        )
        self.main_pos_config.write(
            {
                "use_pricelist": True,
                "available_pricelist_ids": [(4, pricelist.id)],
            }
        )

        self.env["product.product"].create(
            {
                "name": "Generic Product",
                "available_in_pos": True,
                "list_price": 10.0,
                "taxes_id": False,
            }
        )

        self.env["product.product"].create(
            {
                "name": "Discount Product",
                "is_discount": True,
                "available_in_pos": True,
                "list_price": -1.0,
                "taxes_id": False,
            }
        )

        self.main_pos_config.open_ui()

        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "PosDiscountAllTour",
            login="accountman",
        )
