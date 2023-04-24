# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.fr/>)
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: La Louve
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html

from odoo import models, fields, api


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    receipt_options = fields.Selection(
        [
            ('1', 'Do not send receipt via email'),
            ('2', 'Email receipt and print it'),
            ('3', 'Email receipt and print it unless configured on user that \
                   he only receives electronically'),
            ('4', 'Email receipt')
        ], string="Receipt",
        config_parameter='point_of_sale.receipt_options'
    )

    @api.model
    def get_values(self):
        res = super(ResConfigSettings, self).get_values()
        icp_sudo = self.env['ir.config_parameter'].sudo()
        receipt_options = icp_sudo.get_param('point_of_sale.receipt_options')
        res.update(
            receipt_options=receipt_options
        )
        return res

    @api.model
    def get_default_receipt_options(self):
        receipt_options = self.env['ir.values'].get_default(
            'res.config.settings', 'receipt_options')
        return {
            'receipt_options': receipt_options,
        }

    @api.multi
    def set_default_receipt_options(self):
        self.ensure_one()
        return self.env['ir.values'].sudo().set_default(
            'res.config.settings', 'receipt_options',
            self.receipt_options or None)
