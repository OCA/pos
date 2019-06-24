# Copyright 2019 Martronic SA (https://www.martronic.ch)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import tools, _, api, fields, models

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    @api.multi
    def action_view_sales(self):
        self.ensure_one()
        res = super(ProductTemplate, self).action_view_sales()
        action = self.env.ref('pos_sales_report_common.action_product_sale_common_list')
        res.update({
            'name': action.name,
            'help': action.help,
            'type': action.type,
            'view_type': action.view_type,
            'view_mode': action.view_mode,
            'target': action.target,
            'res_model': action.res_model,
        })
        return res
