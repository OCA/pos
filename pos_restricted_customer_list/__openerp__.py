# -*- coding: utf-8 -*-
# © 2017 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': 'POS with limited list of customers downloaded',
    'version': '8.0.0.1.0',
    'category': 'Point Of Sale',
    'summary': 'Optimise load time for POS where customer data not needed',
    'author': 'Therp BV, Odoo Community Association (OCA)',
    'website': 'https://therp.nl',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/assets_backend.xml',
        'views/res_partner.xml',
    ],
    'qweb': [],
}
