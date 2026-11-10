# Copyright 2026 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


class PosSalePickingKeepCommon(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.customer = cls.env["res.partner"].create({"name": "Test partner"})
        main_company = cls._get_main_company()
        cls.warehouse = cls.env["stock.warehouse"].search(
            [("company_id", "=", main_company.id)], limit=1
        )
        cls.product = cls.env["product.product"].create(
            {
                "name": "Test Product",
                "available_in_pos": True,
                "is_storable": True,
                "lst_price": 10.0,
            }
        )
        cls.product_2 = cls.env["product.product"].create(
            {
                "name": "Test Product 2",
                "available_in_pos": True,
                "is_storable": True,
                "lst_price": 10.0,
            }
        )
        cls.main_pos_config.name = "test_pos_sale_picking_keep"
        cls.user_accountman = cls.user

    @classmethod
    def get_default_groups(cls):
        groups = super().get_default_groups()
        return groups | cls.env.ref("point_of_sale.group_pos_user")
