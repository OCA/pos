# Copyright 2026 Miguel Machado
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "POS Product Sequence",
    "summary": "Sort POS products by custom sequence, reference and name",
    "version": "18.0.1.0.0",
    "development_status": "Beta",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Miguel Machado, Odoo Community Association (OCA)",
    "maintainers": ["MiguelMachadoM"],
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": ["point_of_sale"],
    "data": [
        "views/product_template_views.xml",
        "views/product_product_views.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_sequence/static/src/js/product_screen_pos_sequence.esm.js",
        ],
    },
}
