# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Order Settle Unconditional",
    "summary": """Always allow settling orders, even if negative""",
    "category": "Point of Sale",
    "version": "19.0.1.0.0",
    "license": "AGPL-3",
    "author": "ACSONE SA/NV,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": [
        "pos_sale",
    ],
    "data": [
        "views/res_config_settings.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_order_settle_unconditional/static/src/control_buttons_patch.esm.js",
        ],
    },
}
