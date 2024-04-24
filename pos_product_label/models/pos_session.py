# Copyright 2023 Camptocamp SA (https://www.camptocamp.com).
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import Command, models
from odoo.tools import plaintext2html


class PosSession(models.Model):
    _inherit = "pos.session"

    def _prepare_product_label_layout_data(self, data):
        vals = {
            "product_ids": [Command.set(data["product_ids"])],
            "custom_quantity": data["custom_quantity"],
            "print_format": data["print_format"],
            "extra_html": (
                plaintext2html(data["extra_html"]) if data.get("extra_html") else False
            ),
        }
        return vals

    def print_product_labels(self, data):
        """Print product labels from the POS.

        :param data: dict with the following keys:
            - pos_quantity: either 'order' or 'custom'
            - order_quantity_by_product: dict of {product_id: quantity}
            - product_ids: list of product ids
            - custom_quantity: int
            - print_format: str
            - extra_html: str
        """
        vals = self._prepare_product_label_layout_data(data)
        wizard = self.env["product.label.layout"].create(vals)
        if data.get("pos_quantity") == "order":
            wizard = wizard.with_context(
                force_label_qty_by_product=data.get("order_quantity_by_product", {})
            )
        return wizard.process()
