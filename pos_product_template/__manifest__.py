{
    "name": "POS - Product Template",
    "version": "17.0.1.0.0",
    "category": "Point Of Sale",
    "author": "Akretion,Odoo Community Association (OCA)",
    "summary": "Manage Product Template in Front End Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/res_config_settings_view.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_product_template/static/src/pos/**/*.js",
            "pos_product_template/static/src/css/ppt.css",
            "pos_product_template/static/src/pos/**/*.xml",
        ],
    },
    "demo": [
        "demo/product_attribute_value.xml",
        "demo/product_product.xml",
    ],
    "images": [
        "static/src/img/screenshots/pos_product_template.png",
    ],
    "installable": True,
}
