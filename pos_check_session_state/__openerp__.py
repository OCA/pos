# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Check Session State module for OpenERP
#    Copyright (C) 2015 GRAP (http://www.grap.coop)
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
    'name': 'Point Of Sale - Check Session State',
    'summary': 'Check if the session state is still opened',
    'version': '0.1',
    'category': 'Point Of Sale',
    'description': """
Check if the session state is still opened
==========================================

Context:
--------
In Point Of Sale module, the front-end works offline, so all datas are
loaded at the beginning.
At the end of the session, if user do not close the window, it will be
possible to create new pos order on a closed session, generating errors.

Functionality:
--------------
    * This module prevent the possility to create a pos order via the front
      end PoS UI, when session is closed.
    * The session state is checked every 10 seconds. If the state of the
      session is not opened, a blocking pop up is displayed, and user has to
      reload the current page.

Copyright, Authors and Licence:
-------------------------------
    * Copyright: 2015, GRAP: Groupement Régional Alimentaire de Proximité;
    * Author:
        * Sylvain LE GAL (https://twitter.com/legalsylvain);
    * Licence: AGPL-3 (http://www.gnu.org/licenses/);""",
    'author': "GRAP,Odoo Community Association (OCA)",
    'website': 'http://www.grap.coop',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'qweb': [
        'static/src/xml/pos_check_session_state.xml',
    ],
    'js': [
        'static/src/js/pos_check_session_state.js',
    ],
    'css': [
        'static/src/css/pos_check_session_state.css',
    ],
}
