# -*- coding: utf-8 -*-
# © 2016 Acsone SA/NV (http://www.acsone.eu)
# © 2016 Eficent Business and IT Consulting Services S.L.
# (http://www.eficent.com)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
{
    'name': 'POS Sequence Ref Number',
    'version': '8.0.1.0.0',
    'category': 'Point Of Sale',
    'sequence': 1,
    'author': "Eficent Business and IT Consulting Services,"
              "Acsone SA/NV,"
              "Odoo Community Association (OCA)",
    'summary': 'Sequential Order numbers for Point of sale',
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
    'application': False,
    'auto_install': False,
}
