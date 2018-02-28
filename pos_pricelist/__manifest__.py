# -*- coding: utf-8 -*-
# Copyright 2018 Tecnativa - Jairo Llopis
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    'name': 'POS Pricelist',
    'version': '10.0.1.0.1',
    'category': 'Point Of Sale',
    'author': "Tecnativa, "
              "Odoo SA, "
              "Odoo Community Association (OCA)",
    'summary': 'Pricelist for Point of sale',
    'license': 'LGPL-3',
    'post_init_hook': 'post_init_hook',
    'depends': [
        "point_of_sale",
    ],
    "external_dependencies": {
        "python": [
            "oca.decorators",
        ],
    },
    'data': [
        "security/ir.model.access.csv",
        "templates/assets.xml",
        "views/pos_config_view.xml",
    ],
    'qweb': [
        'static/src/xml/pos.xml'
    ],
}
