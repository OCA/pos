# Copyright 2023 kmee
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Stock Scrap",
    "summary": """
        Provides a popup on POS for creating stock scrap movements.""",
    "version": "14.0.1.0.0",
    "license": "AGPL-3",
    "author": "KMEE,Odoo Community Association (OCA)",
    "maintainers": ["felipezago"],
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale", "scrap_reason_code", "mrp"],
    "data": [
        "security/scrap_reason_code.xml",
        "views/pos_config.xml",
        "views/pos_template.xml",
    ],
    "qweb": [
        "static/src/xml/CustomSelect.xml",
        "static/src/xml/StockScrapButton.xml",
        "static/src/xml/Popups/StockScrapPopup.xml",
    ],
}
