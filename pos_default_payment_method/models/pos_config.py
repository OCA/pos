# Copyright (C) 2017-TODAY Camptocamp SA (<http://www.camptocamp.com>).
# @author: Simone Orsi (https://twitter.com/simahawk)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from odoo import fields, models, api, exceptions, _


class PosConfig(models.Model):
    _inherit = 'pos.config'

    default_payment_method_id = fields.Many2one(
        comodel_name='account.journal',
        string='Default payment method',
        domain=[('journal_user', '=', True),
                ('type', 'in', ['bank', 'cash'])],
    )

    @api.constrains('journal_ids', 'default_payment_method_id')
    def _check_default_payment_method_id(self):
        if not self.default_payment_method_id:
            return
        if self.default_payment_method_id not in self.journal_ids:
            raise exceptions.ValidationError(_(
                "The default payment journal "
                "is not enabled on this configuration."
            ))
