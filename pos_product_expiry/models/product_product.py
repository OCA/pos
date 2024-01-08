# Copyright 2024 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, fields, models


class ProductProduct(models.Model):
    _inherit = "product.product"

    def check_pos_lots(self, lots, company_id):
        self.ensure_one()
        found_lots = (
            self.env["stock.lot"]
            .sudo()
            .search(
                [
                    ("product_id", "=", self.id),
                    ("name", "in", lots),
                    "|",
                    ("company_id", "=", company_id),
                    ("company_id", "=", False),
                ]
            )
        )
        if len(lots) > len(found_lots):
            return _("Some lots couldn't be found")
        now = fields.Datetime.now()
        if found_lots.filtered(lambda r: r.expiration_date and r.expiration_date < now):
            return _(
                "Some lots are expired and you are not enabled to sell expired lots"
            )
        return False
