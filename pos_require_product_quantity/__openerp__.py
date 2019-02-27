# coding: utf-8
# Copyright 2019 Coop IT Easy SCRLfs
# 	    Robin Keunen <robin@coopiteasy.be>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Require Product Quantity in POS",
    "version": "9.0.0.1.0",
    "author": "Coop IT Easy SCRLfs, Odoo Community Association (OCA)",
    "website": "www.coopiteasy.be",
    "license": "AGPL-3",
    "category": "Point of Sale",
    "summary": """
        A popup is shown if product quantity is set to 0 for one or more order
        lines when clicking on "Payment" button.
    """,
    "depends": [
        'point_of_sale',
    ],
    'data': [
        'views/pos_config.xml',
        'static/src/xml/templates.xml',
    ],
    'installable': True,
}
