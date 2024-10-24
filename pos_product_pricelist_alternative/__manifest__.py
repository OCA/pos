# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "POS Product Pricelist Alternative",
    "summary": "Calculate POS product price based on alternative pricelists",
    "version": "16.0.1.0.0",
    "license": "AGPL-3",
    "category": "Point of Sale",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "depends": [
        "product_pricelist_alternative",
        "point_of_sale",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_product_pricelist_alternative/static/src/**/*.js",
        ],
    },
    "website": "https://github.com/OCA/pos",
    "installable": True,
    "auto_install": False,
}
