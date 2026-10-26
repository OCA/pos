# Copyright 2026 Acysos S.L.
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import _, api, fields, models
from odoo.exceptions import UserError


class ProductTemplate(models.Model):
    _inherit = "product.template"

    is_combo = fields.Boolean(
        string="Use as Combo",
        default=False,
        help="Enable this option for creating a POS combo product.",
    )
    combo_pack_ids = fields.One2many(
        comodel_name="product.combo.pack",
        inverse_name="product_tmpl_id",
        string="Product Pack",
        copy=True,
    )

    @api.onchange("is_combo")
    def _onchange_is_combo(self):
        for record in self:
            if record.is_combo:
                record.sale_ok = True
                record.available_in_pos = True

    @api.constrains("is_combo", "combo_pack_ids")
    def _check_duplicate_combo_categories(self):
        for template in self.filtered("is_combo"):
            unrequired_categ_ids = set()
            required_categ_ids = set()
            for line in template.combo_pack_ids:
                categ_id = line.pos_category_id.id
                if not categ_id:
                    continue
                if line.is_required:
                    if categ_id in required_categ_ids:
                        raise UserError(
                            _(
                                "You can't create duplicated required "
                                "product category line."
                            )
                        )
                    required_categ_ids.add(categ_id)
                else:
                    if categ_id in unrequired_categ_ids:
                        raise UserError(
                            _(
                                "You can't create duplicated un-required "
                                "product category line."
                            )
                        )
                    unrequired_categ_ids.add(categ_id)
