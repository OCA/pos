# Copyright 2025 Jacques-Etienne Baudoux (BCIM) <je@bcim.be>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)

from odoo import fields, models
from odoo.osv.expression import AND


class PosConfig(models.Model):
    _inherit = "pos.config"

    def _get_available_product_domain(self):
        domain = super()._get_available_product_domain()
        available_products = self.env["product.product"].with_context(location=self.picking_type_id.default_location_src_id.ids).search(AND([domain, [
            ("is_storable", "=", True), ("qty_available", "!=", False)]]))
        domain = AND([
            domain,
            ["|", ("is_storable", "=", False), ("id", "in", available_products.ids)]])
        return domain
