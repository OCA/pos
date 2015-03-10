# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Keep Draft Orders module for Odoo
#    Copyright (C) 2013-Today GRAP (http://www.grap.coop)
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
    'name': 'Point Of Sale - Keep Draft Orders ',
    'version': '2.1',
    'category': 'Point of Sale',
    'description': """
Allow to close a Session even if there are some PoS Orders in draft state
=========================================================================

By default, in Odoo, All PoS Orders must be in 'paid' or 'invoiced' state to
allow user to close the session;

This module can be usefull to manage Orders in slate for some customers;

Features:
---------
With this Module:
    * if a PoS order is in a 'draft' mode (without any payment), the PoS order
      will be unassociated to the current session, when closing the session;
    * When opening a new session, the PoS Orders in 'draft' state will be
      associated to the new session, based on the user_id;
    * Add a new computed field 'is_partial_paid' on PoS Order:
        * This field is True, if the PoS order is in a draft mode with
          some payments;
        * In the tree view, the partial_paid orders are displayed in red
          colors;
        * Forbid to close a session if there is a partial paid Order, to avoid
          to have Account Move Lines that can not be reconciled;

    * A new field 'allow_slate' is available in PoS Config Model, to allow
      or block the user to let Orders in slate;

Copyright, Authors and Licence:
-------------------------------
    * Copyright:
        * 2013-Today, GRAP: Groupement Régional Alimentaire de Proximité;
    * Author:
        * Julien WESTE;
        * Sylvain LE GAL (https://twitter.com/legalsylvain);
    * Licence: AGPL-3 (http://www.gnu.org/licenses/);""",
    'author': 'GRAP',
    'website': 'http://www.grap.coop',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'view/view.xml',
    ],
    'demo': [
        'demo/pos_config.yml',
    ],
}
