# Copyright 2018-21 ForgeFlow S.L. (https://www.forgeflow.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import api, models, fields, _
from odoo.exceptions import ValidationError


class PosConfig(models.Model):
    _inherit = "pos.config"

    adyen_payment_method_present = fields.Boolean(
        compute="_compute_adyen_payment_method_present",
        help="Technical field to check whether there is an Adyen Payment Method "
             "configured for this config"
    )
    adyen_terminal_identifier = fields.Char(
        help='[Terminal model]-[Serial number], '
             'for example: P400Plus-123456789',
        copy=False
    )
    adyen_passive_shopper_recognition = fields.Boolean(
        string="Enable Passive Shopper Recognition",
        help="Gain insights to grow your business.",
    )
    adyen_active_shopper_recognition = fields.Boolean(
        string="Enable Active Shopper Recognition",
        help="Engage recognized shoppers by personalizing their shopping experience.",
    )
    adyen_automated_payment = fields.Boolean(
        string="Enable Adyen online payment with stored token",
    )
    adyen_latest_response = fields.Char(
        help='Technical field used to buffer the latest asynchronous '
             'notification from Adyen.',
        copy=False,
        groups='base.group_erp_manager'
    )
    adyen_latest_diagnosis = fields.Char(
        help='Technical field used to determine if the terminal is still '
             'connected.',
        copy=False,
        groups='base.group_erp_manager'
    )

    def get_pos_config_from_adyen_terminal(self, terminal_identifier):
        return self.env['pos.config'].sudo().search([
            ('adyen_terminal_identifier', '=', terminal_identifier)], limit=1)

    def _is_write_forbidden(self, fields):
        whitelisted_fields = {
            'adyen_latest_response', 'adyen_latest_diagnosis'
        }
        return super()._is_write_forbidden(fields - whitelisted_fields)

    @api.constrains('adyen_terminal_identifier')
    def _check_adyen_terminal_identifier(self):
        for config in self:
            if not config.adyen_terminal_identifier:
                continue
            existing_config = self.search([
                ('id', '!=', config.id),
                ('adyen_terminal_identifier', '=',
                 config.adyen_terminal_identifier)
            ], limit=1)
            if existing_config:
                raise ValidationError(
                    _('Terminal %s is already used on PoS configuration %s.')
                    % (
                        config.adyen_terminal_identifier,
                        existing_config.display_name
                    )
                )

    def _compute_adyen_payment_method_present(self):
        return any(
            [journal.use_payment_terminal == "adyen" for journal in self.journal_ids])
