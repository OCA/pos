from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    @api.model
    def _domain_iface_sale_order_report_id(self):
        """
        Return domain to select report to print via PoS after create Sale Order
        """
        return [
            ("model", "=", "sale.order"),
            ("report_type", "=", "qweb-pdf"),
        ]

    iface_sale_order_report_id = fields.Many2one(
        "ir.actions.report",
        domain=lambda self: self._domain_iface_sale_order_report_id(),
    )
