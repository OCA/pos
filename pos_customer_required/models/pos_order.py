# -*- coding: utf-8 -*-
# Copyright (C) 2004-Today Apertoso NV (<http://www.apertoso.be>)
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Jos DE GRAEVE (<Jos.DeGraeve@apertoso.be>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import fields, models, exceptions, api
from openerp.tools.translate import _


class PosOrder(models.Model):
    _inherit = 'pos.order'

    require_customer = fields.Boolean(
        compute='_compute_require_customer', string='Require customer',
        help="True if a customer is required to begin the order.\n"
        "See the PoS Config to change this setting")

    @api.multi
    @api.depends('session_id.config_id.require_customer')
    def _compute_require_customer(self):
        for order in self:
            order.require_customer = (
                order.session_id.config_id.require_customer == 'order')

    @api.multi
    @api.constrains('partner_id', 'require_customer')
    def _check_partner(self):
        for order in self:
            if (order.session_id.config_id.require_customer == 'order' and
                    not order.partner_id):
                raise exceptions.ValidationError(
                    _('Customer is required for this order and is missing.'))
