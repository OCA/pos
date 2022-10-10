# Copyright (C) Odoo SA. (<http://odoo.com>)
# License LGPL-3 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "POS Cash Control",
    "summary": """Point of sale: Control of the opening of the cashier,
    and cash in/cash out operation.""",
    "version": "14.0.1.0.0",
    "author": "KMEE, Odoo Community Association (OCA), Odoo SA",
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        # Views
        "views/pos_assets_common.xml",
    ],
    "qweb": [
        "static/src/xml/Chrome.xml",
        "static/src/xml/ChromeWidgets/CashMoveButton.xml",
        "static/src/xml/Popups/CashMovePopup.xml",
    ],
}
