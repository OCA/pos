# Copyright 2026 INVITU (https://www.invitu.com)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import Command
from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestFrontend(TestPointOfSaleHttpCommon):
    def test_reprint_kitchen_receipt(self):
        category = self.env["pos.category"].create({"name": "Kitchen Test"})
        self.env["product.product"].create(
            {
                "name": "Kitchen Dish",
                "available_in_pos": True,
                "list_price": 10.0,
                "taxes_id": False,
                "pos_categ_ids": [Command.link(category.id)],
            }
        )
        # No real printer behind this address: printing fails and shows a dialog.
        printer = self.env["pos.printer"].create(
            {
                "name": "Kitchen Printer",
                "proxy_ip": "127.0.0.1",
                "product_categories_ids": [Command.link(category.id)],
            }
        )
        self.main_pos_config.write(
            {"is_order_printer": True, "printer_ids": [Command.link(printer.id)]}
        )
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self.start_pos_tour("PosKitchenReceiptReprintTour")
