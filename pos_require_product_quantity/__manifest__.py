# Copyright 2019-2020 Coop IT Easy SCRLfs
# 	    Robin Keunen <robin@coopiteasy.be>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Require Product Quantity in POS",
    "version": "12.0.0.2.1",
    "author": "Coop IT Easy SCRLfs, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
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
        'views/assets.xml',
    ],
    'installable': True,
}
