import logging

from odoo import fields, models

_logger = logging.getLogger(__name__)


class PosConfig(models.Model):
    _inherit = "pos.config"

    display_product_quantity = fields.Boolean(
        default=True,
    )
    main_warehouse_id = fields.Many2one(
        "stock.warehouse",
        related="picking_type_id.warehouse_id",
        store=True,
    )
    additional_warehouse_ids = fields.Many2many(
        "stock.warehouse",
        "pos_config_stock_warehouse_rel",
        "pos_config_id",
        "warehouse_id",
        string="Additional Warehouses",
        domain="[('company_id', '=', company_id)]",
        help="For the selected warehouses will be displayed "
        "quantity of available products in the POS",
    )
    minimum_product_quantity_alert = fields.Float(
        default=0.0,
    )

    def _get_channel_name(self):
        """
        Return full channel name as combination, POS Config ID and const CHANNEL
        """
        self.ensure_one()
        return '["{}","{}"]'.format("pos_stock_available_online", self.id)

    def _notify_available_quantity(self, message):
        """
        Notify POSes about product updates
        """
        if not isinstance(message, list):
            message = [message]
        notifications = []
        for config in self:
            notifications.append(
                [config._get_channel_name(), "pos.config/product_update", message]
            )
        if notifications:
            self.env["bus.bus"]._sendmany(notifications)
            _logger.debug("POS notifications for %s: %s", self.ids, notifications)
