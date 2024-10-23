{
    "name": "POS - Product Template",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "author": "Akretion,Odoo Community Association (OCA)",
    "summary": "Manage product template in front end point of sale",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/res_config_settings.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_product_template/static/src/**/*.js",
            "pos_product_template/static/src/css/ppt.css",
            "pos_product_template/static/src/xml/**/*.xml",
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
