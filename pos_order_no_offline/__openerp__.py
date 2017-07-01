# -*- coding: utf-8 -*-
# Copyright 2017 Akretion (http://www.akretion.com).
# @author Sébastien BEAU <sebastien.beau@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "POS Order no offline mode",
    "summary": "Remove offine mode on pos order",
    "version": "8.1.0.0",
    "category": "Point Of Sale",
    "website": "www.akretion.com",
    'author': 'Akretion,Odoo Community Association (OCA)',
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "external_dependencies": {
        "python": [],
        "bin": [],
    },
    "depends": [
        "base",
    ],
    "data": [
        'view/pos_order_no_offline.xml',
    ],
    "demo": [
    ],
    "qweb": [
    ]
}
