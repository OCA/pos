# Copyright 2022 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Report Sale Details",
    "summary": """
        Moves the Sales Details report to the pos_report_engine reporting screen""",
    "version": "14.0.1.0.0",
    "license": "AGPL-3",
    "author": "KMEE,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": [
        "pos_report_engine",
    ],
    "data": ["views/assets.xml"],
    "qweb": [
        "static/src/xml/SaleDetailsButton.xml",
    ],
}
