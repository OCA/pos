# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "PoS Product packaging container deposit",
    "summary": "Add the container deposit fees in a POS order",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "point_of_sale",
        "product_packaging_container_deposit",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_product_packaging_container_deposit/static/src/js/**/*",
        ],
        "web.assets_tests": [
            "pos_product_packaging_container_deposit/tests/tours/TestDepostit.tour.js",
        ],
    },
}
