# Copyright 2024 Camptocamp SA
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from odoo.tests import tagged

from odoo.addons.base.tests.common import DISABLED_MAIL_CONTEXT
from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestUi(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env["base"].with_context(**DISABLED_MAIL_CONTEXT).env
        cls.env.ref("stock.group_tracking_lot").users += cls.env.user
        cls.package_type_pallet = cls.env.ref("stock.package_type_01")
        cls.package_type_box = cls.env.ref("stock.package_type_02")
        cls.package_type_pallet.container_deposit_product_id = cls.env[
            "product.product"
        ].create(
            {
                "name": "EUROPAL",
                "detailed_type": "service",
            }
        )
        cls.package_type_box.container_deposit_product_id = cls.env[
            "product.product"
        ].create(
            {
                "name": "Box",
                "detailed_type": "service",
            }
        )
        cls.product_packaging_level_pallet = (
            cls.env["product.packaging.level"]
            .sudo()
            .create(
                {
                    "name": "PALLET",
                    "code": "PAL",
                    "sequence": 1,
                    "name_policy": "by_package_type",
                }
            )
        )
        cls.product_packaging_level_box = (
            cls.env["product.packaging.level"]
            .sudo()
            .create(
                {
                    "name": "BOX",
                    "code": "BOX",
                    "sequence": 1,
                    "name_policy": "by_package_type",
                }
            )
        )
        cls.packaging = cls.env["product.packaging"].create(
            [
                {
                    "name": "Box of 12",
                    "qty": 12,
                    "package_type_id": cls.package_type_box.id,
                    "packaging_level_id": cls.product_packaging_level_box.id,
                    "barcode": "A0001",
                },
                {
                    "name": "Box of 24",
                    "qty": 24,
                    "package_type_id": cls.package_type_box.id,
                    "packaging_level_id": cls.product_packaging_level_box.id,
                    "barcode": "A0002",
                },
                {
                    "name": "EU pallet",
                    "qty": 240,
                    "package_type_id": cls.package_type_pallet.id,
                    "packaging_level_id": cls.product_packaging_level_pallet.id,
                    "barcode": "A0003",
                },
            ]
        )

        cls.product_a = cls.env["product.product"].create(
            {
                "name": "Product A",
                "packaging_ids": [(6, 0, cls.packaging.ids)],
                "available_in_pos": True,
            }
        )

        cls.product_b = cls.env["product.product"].create(
            {
                "name": "Product B",
                "packaging_ids": [
                    (
                        6,
                        0,
                        [
                            pack.copy({"barcode": pack.barcode.replace("A", "B")}).id
                            for pack in cls.packaging
                        ],
                    )
                ],
                "available_in_pos": True,
            }
        )
        cls.pallet = cls.package_type_pallet.container_deposit_product_id
        cls.box = cls.package_type_box.container_deposit_product_id

    def test_pos_order_to_sale_order(self):
        self.main_pos_config.open_ui()

        if "iface_important_buttons" in self.main_pos_config._fields:
            self.main_pos_config.iface_important_buttons = "CreateOrderButton"

        self.start_tour(
            f"/pos/ui?debug=assets&config_id={self.main_pos_config.id}",
            "TestDepositProduct",
            login="accountman",
        )
