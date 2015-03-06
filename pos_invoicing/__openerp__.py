# -*- encoding: utf-8 -*-
##############################################################################
#
#    POS Invoicing module for Odoo
#    Copyright (C) 2013-2014 GRAP (http://www.grap.coop)
#    @author Julien WESTE
#    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
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

{
    'name': 'POS - Invoicing',
    'summary': 'Handle invoicing from POS',
    'version': '2.1',
    'category': 'Point of Sale',
    'description': """
Feature Case 1: (Fix Odoo Behaviour)
------------------------------------
    * When you pay a pos_order, and then create an invoice :
        * you mustn't register a payment against the invoice as the payment
          already exists in POS;
        * The POS payment will be reconciled with the invoice when the session
          is closed.
        * You mustn't modify the invoice because the amount could become
          different from the one registered in POS. Thus we have to
          automatically validate the created invoice.
Feature Case 2: (New feature)
-----------------------------
    * If you want to give an invoice to your POS customer and let him pay
      latter:
        * you have to validate the pos_order without payments and to create
          an invoice to receive the payments.

Functionality:
--------------
    * About the invoices created from POS after payment:
        * automatically validate them and don't allow modifications;
        * remove the Pay button;
        * Don't display them in the Customer Payment tool;
    * About the invoices created from POS before payment:
        * possibility to create a draft invoice from a draft pos_order;

Technically:
------------
    * add a forbid_payment flag on account_invoice to mark the items that
        shouldn't be paid.

Copyright, Authors and Licence:
-------------------------------
    * Copyright: 2013-Today GRAP: Groupement Régional Alimentaire de Proximité;
    * Author:
        * Julien WESTE;
        * Sylvain LE GAL (https://twitter.com/legalsylvain);
    * Licence: AGPL-3 (http://www.gnu.org/licenses/);""",
    'author': 'GRAP',
    'website': 'http://www.grap.coop',
    'license': 'AGPL-3',
    'depends': [
        'account',
        'account_voucher',
        'point_of_sale',
    ],
    'data': [
        'view/pos_invoice_draft_order_wizard_view.xml',
        'view/action.xml',
        'view/view.xml',
    ],
    'demo': [
        'demo/res_groups.yml',
    ],
}
