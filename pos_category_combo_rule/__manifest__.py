# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Category Combo Rule",
    "summary": """
        Point of Sale: This module allows you to create rules to apply discounts automatically
        on certains items, based on their categories.
    """,
    "version": "14.0.1.0.0",
    "license": "AGPL-3",
    "author": "KMEE,Odoo Community Association (OCA)",
    "maintainers": ["felipezago"],
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "data": [
        "security/combo_rule.xml",
        "views/combo_rule.xml",
        "views/pos_template.xml",
    ],
    "qweb": ["static/src/xml/Screens/ProductScreen/Orderline.xml"],
}
