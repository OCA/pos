# Copyright (C) 2024 Open Source Integrators (https://www.opensourceintegrators.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "POS Product Warnings",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "summary": "This module is display product warnings while processing"
    " payments in the POS screen.",
    "depends": ["point_of_sale"],
    "website": "https://github.com/OCA/pos",
    "author": "Open Source Integrators, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "data": ["views/product_view.xml"],
    "assets": {
        "point_of_sale.assets": [
            "pos_product_warning/static/src/xml/ProductWarningPopup.xml",
            "pos_product_warning/static/src/js/*.esm.js",
        ],
    },
    "installable": True,
    "maintainers": ["dreispt"],
}
