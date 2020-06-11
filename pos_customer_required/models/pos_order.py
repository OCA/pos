# Copyright (C) 2004-Today Apertoso NV (<http://www.apertoso.be>)
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: Jos DE GRAEVE (<Jos.DeGraeve@apertoso.be>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models, exceptions, api, _


class PosOrder(models.Model):
    _inherit = 'pos.order'

    require_customer = fields.Selection(
        related='session_id.config_id.require_customer',
    )

    @api.constrains('partner_id', 'session_id')
    def _check_partner(self):
        for rec in self:
            if rec.require_customer != 'no' and not rec.partner_id:
                raise exceptions.ValidationError(_(
                    'Customer is required for this order and is missing.'))
