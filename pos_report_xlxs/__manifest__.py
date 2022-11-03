# Copyright 2022 KMEE
# License LGPL-3 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Pos Report Xlxs",
    "summary": """Point of Sale: Reports in xlxs""",
    "version": "14.0.1.0.0",
    "author": "KMEE, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "depends": [
        "point_of_sale",
        "pos_hr",
    ],
    "data": [
        "security/ir.model.access.csv",
        "wizards/pos_items_sales_report.xml",
    ],
}
