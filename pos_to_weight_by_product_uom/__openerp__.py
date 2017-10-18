# -*- coding: utf-8 -*-
# Copyright 2017, Grap
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Pos to weight by product uom",
    "summary": "Module summary",
    "version": "8.0.1.0.0",
    "category": "Uncategorized",
    "website": "https://github.com/OCA/pos",
    "author": "GRAP, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "external_dependencies": {
        "python": [],
        "bin": [],
    },
    "depends": [
        "product",
    ],
    "data": [
        'views/pos_to_weight.xml',
    ],
    'demo': [
        'demo/product_uom_categ_demo.xml',
        'demo/product_uom_demo.xml'
    ]
}
