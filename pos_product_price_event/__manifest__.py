# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Product Price Event",
    "summary": """
        Point of Sale: This module makes it possible to create events based on week days
        to change the price of determined products.
    """,
    "version": "14.0.1.0.0",
    "license": "AGPL-3",
    "author": "KMEE,Odoo Community Association (OCA)",
    "maintainers": ["felipezago"],
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "data": [
        "data/resource_product_event.xml",
        "security/resource_product_event.xml",
        "views/resource_product_event.xml",
        "views/pos_template.xml",
        "views/res_config_settings.xml",
    ],
}
