# -*- coding: utf-8 -*-
##############################################################################
#
#    POS Customer Display module for Odoo
#    Copyright (C) 2014 Aurélien DUMAINE
#    Copyright (C) 2015 Akretion (www.akretion.com)
#    @author: Alexis de Lattre <alexis.delattre@akretion.com>
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

from openerp import models, fields, api, _
from openerp.exceptions import ValidationError


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
                    raise ValidationError(
                        _("The message for customer display '%s' is too "
                            "long: it has %d chars whereas the maximum "
                            "is %d chars.")
                        % (field, len(msg), maxsize))
