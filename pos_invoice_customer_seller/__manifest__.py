# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Invoice Customer Seller",
    "summary": """This module allows to set the invoice seller from POS
    if there is one defined on the customer side.""",
    "version": "18.0.1.0.0",
    "license": "AGPL-3",
    "maintainers": ["rousseldenis"],
    "author": "ACSONE SA/NV,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "data": ["views/res_config_settings.xml"],
}
