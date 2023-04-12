# Copyright 2022 KMEE
# License LGPL-3 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Pos CRM",
    "summary": """Point of Sale: Ask Customer Code or Tax ID""",
    "version": "14.0.1.0.0",
    "author": "KMEE, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "maintainers": ["mileo", "ygcarvalh"],
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/pos_order.xml",
        "views/pos_config.xml",
        # Templates
        "views/pos_template.xml",
    ],
    "qweb": [
        "static/src/xml/Popups/TaxIdPopup.xml",
    ],
}
