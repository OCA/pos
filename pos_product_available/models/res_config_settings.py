from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    available_product = fields.Boolean()
    available_product_ids = fields.Many2many(
        comodel_name="product.template",
        string="Restrict products for this point of sale",
    )


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"
    _description = "Point of Sale Config Visible Products"

    pos_available_product = fields.Boolean(
        related="pos_config_id.available_product", readonly=False
    )
    pos_available_product_ids = fields.Many2many(
        "product.template",
        string="Restrict products for this point of sale",
        compute="_compute_pos_available_product_ids",
        readonly=False,
        store=True,
    )

    @api.depends("pos_available_product", "pos_config_id")
    def _compute_pos_available_product_ids(self):
        for res_config in self:
            if not res_config.pos_available_product:
                res_config.pos_available_product_ids = False
            else:
                res_config.pos_available_product_ids = (
                    res_config.pos_config_id.available_product_ids
                )
