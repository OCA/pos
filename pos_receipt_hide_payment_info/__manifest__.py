# Copyright 2025 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Receipt Hide Payment Info",
    "summary": """Hide payment informations from receipt""",
    "version": "18.0.1.0.0",
    "license": "AGPL-3",
    "author": "ACSONE SA/NV,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "data": ["views/pos_payment_method.xml"],
    "assets": {
        "point_of_sale._assets_pos": ["pos_receipt_hide_payment_info/static/src/**/*"],
    },
}
