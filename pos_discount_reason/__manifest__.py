# Copyright 2022 KMEE
# License LGPL-3 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Pos Discount Reason",
    "summary": """Point of Sale: Ask the discount reason before apply it""",
    "version": "14.0.1.0.0",
    "author": "KMEE, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "maintainers": ["mileo"],
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "security/pos_discount_reason.xml",
        # Data
        "data/pos_discount_reason.xml",
        # Views
        "views/pos_discount_reason.xml",
        "views/pos_order_line.xml",
        # Templates
        "views/pos_template.xml",
    ],
    "qweb": [
        "static/src/xml/DiscountReasonButton.xml",
    ],
}
