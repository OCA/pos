# copyright 2023 Jumeldi PT.SAI
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "POS Margin Access Right",
    "version": "16.0.1.0.1",
    "summary": "POS Margin Access Right",
    "author": "Jumeldi, PT.SAI, Odoo Community Association (OCA)",
    "contributors": "Cetmix",
    "license": "LGPL-3",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "data": ["views/pos_order_view.xml", "views/pos_config_view.xml"],
    "assets": {
        "point_of_sale.assets": [
            "pos_margin_access_right/static/src/js/*.js",
            "pos_margin_access_right/static/src/xml/*.xml",
        ],
    },
    "installable": True,
    "application": False,
}
