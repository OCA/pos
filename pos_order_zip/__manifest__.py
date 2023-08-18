{
    "name": "POS Zipcode",
    "version": "16.0.1.0.0",
    "category": "POS",
    "author": "Open Source Integrators, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "license": "AGPL-3",
    "data": [
        "security/ir.model.access.csv",
        "views/pos_config_views.xml",
        "views/pos_order_views.xml",
        "views/order_zip_code.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "/pos_order_zip/static/src/js/ZipCodeScreen.ems.js",
            "/pos_order_zip/static/src/js/ProductScreen.ems.js",
            "/pos_order_zip/static/src/js/models.ems.js",
            "/pos_order_zip/static/src/xml/pos_templates.xml",
        ],
    },
}
