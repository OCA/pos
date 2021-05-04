# Copyright 2021 Odoo SA
# Copyright 2021 Camptocamp SA
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    "name": "Point of Sale Coupons",
    "version": "13.0.1.0.0",
    "category": "Sales/Point Of Sale",
    "sequence": 6,
    "summary": "Use coupons in Point of Sale",
    "license": "LGPL-3",
    "author": "Odoo SA, Camptocamp, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "maintainers": ["ivantodorovich"],
    "depends": ["sale_coupon", "point_of_sale"],
    "data": [
        "data/mail_template_data.xml",
        "data/default_barcode_patterns.xml",
        "security/ir.model.access.csv",
        "views/assets.xml",
        "views/coupon_views.xml",
        "views/coupon_program_views.xml",
        "views/pos_config_views.xml",
        "views/res_config_settings_views.xml",
    ],
    "qweb": ["static/src/xml/**/*", "static/src/xml/*.xml"],
    "demo": ["demo/pos_coupon_demo.xml"],
    "installable": True,
}
