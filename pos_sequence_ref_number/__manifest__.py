# -*- coding: utf-8 -*-
# Copyright 2016-2017 Acsone SA/NV (http://www.acsone.eu) and
# Eficent Business and IT Consulting Services S.L (http://www.eficent.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    'name': 'POS Sequence Ref Number',
    'version': '10.0.1.0.1',
    'category': 'Point Of Sale',
    'sequence': 1,
    'author': "Eficent Business and IT Consulting Services,"
              "Acsone SA/NV,"
              "Odoo Community Association (OCA)",
    'summary': 'Sequential Order numbers for Point of sale',
    'website': 'https://github.com/OCA/pos',
    'license': 'AGPL-3',
    'depends': [
        "point_of_sale",
    ],
    'data': [
        'views/pos_template.xml'
    ],
    'qweb': [
        'static/src/xml/pos.xml'
    ],
    'installable': True,
}
