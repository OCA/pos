# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2004-2010 Tiny SP (<http://tiny.be>).
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

from openerp import models, fields

class account_journal(models.Model):
    _name = 'account.journal'
    _inherit = 'account.journal'
      
    payment_mode = fields.Selection((('card', 'Card'), ('check', 'Check')), 'Payment mode', help="Select the payment mode sent to the payment terminal")

class pos_config(models.Model):
    _name = 'pos.config'
    _inherit = 'pos.config'
       
    iface_payment_terminal = fields.Boolean('Payment Terminal', help="A payment terminal is available on the Proxy")

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
