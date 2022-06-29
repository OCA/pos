# Copyright 2022 Coop IT Easy SC
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Point of Sale Automatically Invoice Default Partner",
    "summary": """
        Compatibility layer between pos_auto_invoice and pos_default_partner.""",
    "version": "12.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://coopiteasy.be",
    "author": "Coop IT Easy SC",
    "license": "AGPL-3",
    "application": False,
    "depends": [
        "pos_auto_invoice",
        "pos_default_partner",
    ],
    "auto-install": True,
    "excludes": [],
    "data": [
        "views/assets.xml",
    ],
    "demo": [],
    "qweb": [],
}
