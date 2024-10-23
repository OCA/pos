# Copyright 2023 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _product_pricelist_item_fields(self):
        result = super()._product_pricelist_item_fields()
        result.append("split_invoice_partner_id")
        result.append("split_base_pricelist_id")
        result.append("split_percentage")
        result.append("split_base")
        return result
