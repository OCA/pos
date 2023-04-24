# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.fr/>)
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: La Louve
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html

from odoo import fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    email_pos_receipt = fields.Boolean(
        string="E-receipt",
        default=False,
        help="If you tick this box and option 3 is selected for 'Receipt'\
         in point of sale settings, the user will only receive e-receipt ")
    no_email_pos_receipt = fields.Boolean(
        string="No E-receipt",
        default=False,
        help="If you tick this box, the user will not receive e-receipt ")
    config_receipt_options = fields.Integer(
        compute="_compute_config_receipt_options"
    )

    def _compute_config_receipt_options(self):
        icp_sudo = self.env['ir.config_parameter'].sudo()
        receipt_options = icp_sudo.get_param('point_of_sale.receipt_options')
        receipt_options = receipt_options and int(receipt_options) or 0
        for record in self:
            record.config_receipt_options = receipt_options
