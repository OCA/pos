# Copyright 2025 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Product Warehouse Available",
    "summary": """
        This modules allows to define warehouses on the POS Config in order to display
        product that are available in thoses warehouses""",
    "version": "16.0.1.0.0",
    "license": "AGPL-3",
    "author": "ACSONE SA/NV,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/res_config_settings.xml",
    ],
    "demo": [],
}
