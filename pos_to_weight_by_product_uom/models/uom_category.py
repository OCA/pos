# Copyright 2017, Grap
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models, api


class UomCategory(models.Model):
    _inherit = 'uom.category'

    to_weigh = fields.Boolean('To weigh', default=False)

    @api.multi
    def action_recompute_to_weigh(self):
        for categ in self:
            domain = [('uom_id.category_id', '=', categ.id)]
            products = self.env['product.template'].search(domain)
            products.write({'to_weight': categ.to_weigh})
