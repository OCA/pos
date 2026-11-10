# Copyright 2026 Acysos S.L.
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "POS Product Combo Configurable",
    "summary": "Configurable product combos and packs in Point of Sale",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Acysos S.L., Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "security/ir.model.access.csv",
        "views/product_template_views.xml",
        "views/pos_config_views.xml",
        "views/res_config_settings_views.xml",
        "views/pos_order_views.xml",
        "views/report_invoice.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_product_combo_configurable/static/src/scss/pos_combo.scss",
            "pos_product_combo_configurable/static/src/js/**/*.js",
            "pos_product_combo_configurable/static/src/xml/**/*.xml",
        ],
    },
}
