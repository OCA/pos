# © 2014-2016 Aurélien DUMAINE
# © 2015-2016 Akretion (Alexis de Lattre <alexis.delattre@akretion.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models, fields


class AccountJournal(models.Model):
    _inherit = 'account.journal'

    pos_terminal_payment_mode = fields.Selection(
        selection=[('card', 'Card'), ('check', 'Check')],
        string='Terminal Payment Mode',
        help="Select the payment mode sent to the payment terminal")
