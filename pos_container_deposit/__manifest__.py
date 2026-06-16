{
    "name": "POS Container Deposit",
    "version": "16.0.1.0.1",
    "category": "Point of Sale",
    "summary": "This module is used to manage container deposits for products"
    " in Point of Sale.",
    "author": "Therp B.V., Sunflower IT, Open2bizz, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": [
        "views/product_template.xml",
    ],
    "demo": [
        "demo/product_product.xml",
    ],
    "assets": {
        "web.assets_tests": [
            "pos_container_deposit/static/tests/tours/*.js",
        ],
        "point_of_sale.assets": [
            "pos_container_deposit/static/src/js/*.js",
        ],
    },
    "installable": True,
}
