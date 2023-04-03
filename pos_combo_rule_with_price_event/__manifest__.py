# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Combo Rule With Price Event",
    "summary": """
        This module works as a tie-breaker for when using both combo rule and
        price event discount simultaneously. It will assume always the smaller product price.
    """,
    "version": "14.0.1.0.0",
    "license": "AGPL-3",
    "author": "KMEE,Odoo Community Association (OCA)",
    "maintainers": ["felipezago"],
    "website": "https://github.com/OCA/pos",
    "depends": ["pos_category_combo_rule", "pos_product_price_event"],
    "data": [
        "views/pos_template.xml",
    ],
}
