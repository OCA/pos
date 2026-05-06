# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class ProductProduct(models.Model):
    _inherit = "product.product"

    pos_sequence = fields.Integer(
        string="POS sequence",
        related="product_tmpl_id.pos_sequence",
        readonly=False,
        store=True,
    )

    @api.model
    def _load_pos_data_fields(self, config_id):
        fields_list = super()._load_pos_data_fields(config_id)
        if "pos_sequence" not in fields_list:
            fields_list = list(fields_list) + ["pos_sequence"]
        return fields_list
