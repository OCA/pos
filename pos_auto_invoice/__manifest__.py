# Copyright 2022 Coop IT Easy SC
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Point of Sale Automatically Invoice",
    "summary": """
        In the POS, set orders as to-invoice by default.""",
    "version": "12.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://coopiteasy.be",
    "author": "Coop IT Easy SC",
    "license": "AGPL-3",
    "application": False,
    "depends": [
        "point_of_sale",
    ],
    "excludes": [],
    "data": [
        "templates/assets.xml",
    ],
    "demo": [],
    "qweb": [],
}
