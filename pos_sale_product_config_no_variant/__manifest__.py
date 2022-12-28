# Copyright (C) 2022 Open Source Integrators (https://www.opensourceintegrators.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "POS - Product Configurator No Variant",
    "version": "16.0.1.0.0",
    "summary": "Manage Point Of Sale via Configurator of no variant",
    "author": "Open Source Integrators, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Point of Sale",
    "maintainer": "Open Source Integrators",
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "data": ["views/pos_order_views.xml"],
    "maintainers": ["ursais"],
    "installable": True,
    "assets": {
        "point_of_sale.assets": [
            "pos_sale_product_config_no_variant/static/src/js/**/*.js",
        ],
    },
}
