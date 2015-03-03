# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Second Header module for OpenERP
#    Copyright (C) 2014 GRAP (http://www.grap.coop)
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
    'name': 'Point Of Sale - Second Header',
    'summary': 'Add a second header in the Point Of Sale (front-end)',
    'version': '0.1',
    'category': 'Point Of Sale',
    'description': """
Add a second header in the Point Of Sale (front-end)
====================================================

Functionality:
--------------
    * Add a second banner in the point of sale page under the the first one,"""
    """dedicated to extra-information of the current pos order;

Copyright, Authors and Licence:
-------------------------------
    * Copyright: 2014, GRAP: Groupement Régional Alimentaire de Proximité;
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
        'static/src/xml/psh.xml',
    ],
    'js': [
        'static/src/js/psh.js',
    ],
    'css': [
        'static/src/css/psh.css',
    ],
}
