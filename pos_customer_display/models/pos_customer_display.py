# -*- coding: utf-8 -*-
# © 2014-2016 Aurélien DUMAINE
# © 2015-2016 Akretion (Alexis de Lattre <alexis.delattre@akretion.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class PosConfig(models.Model):
    _inherit = 'pos.config'

    iface_customer_display = fields.Boolean(
        string='Customer Display', help="Display data on the customer display")
    customer_display_line_length = fields.Integer(
        string='Line Length of the Customer Display', default=20,
        help="Length of the LEDs lines of the customer display")
    customer_display_msg_next_l1 = fields.Char(
        string="Next Customer (top line)", default="Welcome!",
        help="Top line of the message on the customer display which is "
        "displayed after starting POS and also after validation of an order")
    customer_display_msg_next_l2 = fields.Char(
        string="Next Customer (bottom line)", default="Point of Sale Open",
        help="Bottom line of the message on the customer display which is "
        "displayed after starting POS and also after validation of an order")
    customer_display_msg_closed_l1 = fields.Char(
        string="POS Closed (top line)", default="Point of Sale Closed",
        help="Top line of the message on the customer display which "
        "is displayed when POS is closed")
    customer_display_msg_closed_l2 = fields.Char(
        string="POS Closed (bottom line)", default="See you soon!",
        help="Bottom line of the message on the customer display which "
        "is displayed when POS is closed")

    @api.one
    @api.constrains(
        'customer_display_line_length',
        'customer_display_msg_next_l1', 'customer_display_msg_next_l2',
        'customer_display_msg_closed_l1', 'customer_display_msg_closed_l2')
    def _check_customer_display_length(self):
        if self.customer_display_line_length:
            maxsize = self.customer_display_line_length
            to_check = {
                _('Next Customer (top line)'):
                self.customer_display_msg_next_l1,
                _('Next Customer (bottom line)'):
                self.customer_display_msg_next_l2,
                _('POS Closed (top line)'):
                self.customer_display_msg_closed_l1,
                _('POS Closed (bottom line)'):
                self.customer_display_msg_closed_l2,
            }
            for field, msg in to_check.iteritems():
                if msg and len(msg) > maxsize:
                    raise ValidationError(_(
                        "The message for customer display '%s' is too "
                        "long: it has %d chars whereas the maximum "
                        "is %d chars.")
                        % (field, len(msg), maxsize))
