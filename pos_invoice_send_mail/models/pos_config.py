# Copyright 2019 Druidoo - Iván Todorovich
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models, fields, _
from odoo.exceptions import ValidationError


class PosConfig(models.Model):
    _inherit = 'pos.config'

    iface_invoice_mail = fields.Boolean('Send Invoice by Mail')

    invoice_mail_template_id = fields.Many2one(
        'mail.template',
        string='Invoice Email Template',
        domain=[('model', '=', 'account.invoice')],
        context=lambda self: {
            'default_model_id': self.ref('account.model_account_invoice').id,
        },
        default=lambda self:
            self.env.ref('account.email_template_edi_invoice', False),
    )

    @api.constrains('iface_invoice_mail', 'invoice_mail_template_id')
    def _check_invoice_mail_templat_id(self):
        for rec in self.filtered('iface_invoice_mail'):
            if not rec.invoice_mail_template_id:
                raise ValidationError(_('Invoice Email Template is required'))
