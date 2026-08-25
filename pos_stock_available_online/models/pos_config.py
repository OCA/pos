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
        string="Main Warehouse",
        related="warehouse_id",
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

    def _load_pos_data_read(self, records, config):
        data = super()._load_pos_data_read(records, config)
        values_by_id = {
            record["id"]: record
            for record in records.read(
                ["display_product_quantity", "minimum_product_quantity_alert"],
                load=False,
            )
        }
        for record in data:
            record.update(values_by_id.get(record["id"], {}))
        return data

    def _notify_available_quantity(self, message):
        """
        Notify POSes about product updates
        """
        if not isinstance(message, list):
            message = [message]
        for config in self:
            config._notify("PRODUCT_QUANTITY_UPDATE", message)
        _logger.debug(
            "POS product quantity notifications for %s: %s", self.ids, message
        )
