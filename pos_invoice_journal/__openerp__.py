# -*- coding: utf-8 -*-
# Copyright 2016 Alex Comba - Agile Business Group
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Pos Invoice Journal',
    'summary': 'Use a different journal for the invoices created from the pos',
    'version': '8.0.1.0.0',
    'license': 'AGPL-3',
    'author': 'Agile Business Group, Odoo Community Association (OCA)',
    'website': 'http://www.agilebg.com',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/pos_config.xml',
    ],
}
