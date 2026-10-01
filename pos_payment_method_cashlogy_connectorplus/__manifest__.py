# Copyright 2026 Tecnativa - David Bañón
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "PoS Payment Method CashLogy",
    "summary": "Allows to pay with CashLogy Terminals on the Point of Sale",
    "version": "18.0.1.0.1",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/pos_payment_method_views.xml",
    ],
    "demo": ["demo/cashlogy_demo.xml"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_payment_method_cashlogy_connectorplus/static/src/**/*"
        ],
    },
}
