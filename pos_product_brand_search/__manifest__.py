# Copyright 2025 Akretion (http://www.akretion.com).
# @author Florian Mounier <florian.mounier@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "POS Product Brand Search",
    "version": "14.0.1.0.0",
    "author": "Akretion, Odoo Community Association (OCA)",
    "summary": "Allow searching products by brand in POS",
    "category": "Point of Sale",
    "depends": [
        "point_of_sale",
        "product_brand",  # oca/brand
    ],
    "website": "https://github.com/OCA/pos",
    "data": [
        "views/assets.xml",
    ],
    "maintainers": ["paradoxxxzero"],
    "demo": [],
    "installable": True,
    "license": "AGPL-3",
}
