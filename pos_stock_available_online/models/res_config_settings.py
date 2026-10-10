from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_display_product_quantity = fields.Boolean(
        related="pos_config_id.display_product_quantity",
        readonly=False,
    )
    pos_main_warehouse_id = fields.Many2one(
        "stock.warehouse",
        related="pos_config_id.main_warehouse_id",
    )
    pos_additional_warehouse_ids = fields.Many2many(
        "stock.warehouse",
        related="pos_config_id.additional_warehouse_ids",
        readonly=False,
    )
    pos_minimum_product_quantity_alert = fields.Float(
        related="pos_config_id.minimum_product_quantity_alert",
        readonly=False,
    )
