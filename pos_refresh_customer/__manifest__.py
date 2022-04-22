# Copyright 2022 Coop IT Easy SCRLfs
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Point of Sale Refresh Customer",
    "summary": """
        When a customer is selected in the POS, refresh the customer's data from
        the database.""",
    "version": "12.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://coopiteasy.be",
    "author": "Coop IT Easy SCRLfs,Odoo Community Association (OCA)",
    "maintainers": ["coopiteasy"],
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
