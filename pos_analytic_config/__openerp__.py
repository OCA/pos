# -*- coding: utf-8 -*-
# © 2015 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': "POS Analytic Config",

    'summary': """Use analytic account defined on
                  POS configuration for POS orders""",
    'author': 'ACSONE SA/NV,'
              'Odoo Community Association (OCA)',
    'website': "http://acsone.eu",
    'category': 'Point Of Sale, Accounting',
    'version': '8.0.1.0.0',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],

    'data': [
        'views/pos_config_view.xml',
    ],
}
