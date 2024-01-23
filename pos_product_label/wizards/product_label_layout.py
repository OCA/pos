# Copyright 2023 Camptocamp SA (https://www.camptocamp.com).
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class ProductLabelLayout(models.TransientModel):
    _inherit = "product.label.layout"

    def _prepare_report_data(self):
        xml_id, data = super()._prepare_report_data()
        if self.env.context.get("force_label_qty_by_product"):
            data["quantity_by_product"] = self.env.context["force_label_qty_by_product"]
        return xml_id, data
