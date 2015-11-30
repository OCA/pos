# -*- coding: utf-8 -*-
##############################################################################
#
#     This file is part of pos_analytic_config,
#     an Odoo module.
#
#     Copyright (c) 2015 ACSONE SA/NV (<http://acsone.eu>)
#
#     pos_analytic_config is free software:
#     you can redistribute it and/or modify it under the terms of the GNU
#     Affero General Public License as published by the Free Software
#     Foundation,either version 3 of the License, or (at your option) any
#     later version.
#
#     pos_analytic_config is distributed
#     in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
#     even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
#     PURPOSE.  See the GNU Affero General Public License for more details.
#
#     You should have received a copy of the GNU Affero General Public License
#     along with pos_analytic_config.
#     If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
{
    'name': "POS Analytic Config",

    'summary': """Use analytic account defined on
                  POS configuration for POS orders""",
    'author': 'ACSONE SA/NV,'
              'Odoo Community Association (OCA)',
    'website': "http://acsone.eu",
    'category': 'Point Of Sale',
    'version': '8.0.1.0.0',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],

    'data': [
        'views/pos_config_view.xml',
    ],
}
