# Copyright 2025 Binhex - Adasat Torres de León.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "PoS Order To Sale Order: Commitment Date",
    "version": "16.0.1.0.1",
    "category": "Sales/Point of Sale",
    "summary": "Commitment Date from PoS to Sale Order",
    "depends": ["pos_order_to_sale_order"],
    "website": "https://github.com/OCA/pos",
    "author": "Binhex, Odoo Community Association (OCA)",
    "maintainers": ["adasatorres"],
    "data": [
        "views/res_config_settings_view.xml",
    ],
    "installable": True,
    "assets": {
        "point_of_sale.assets": [
            "pos_order_to_sale_order_commitment_date/static/src/js/**/*.js",
            "pos_order_to_sale_order_commitment_date/static/src/xml/**/*.xml",
            "pos_order_to_sale_order_commitment_date/static/src/scss/**/*.scss",
        ],
    },
    "license": "AGPL-3",
}
