{
    "name": "Point of Sale - Global Discount in Line",
    "summary": "Order discount in line instead of discount product",
    "version": "16.0.1.0.1",
    "category": "Point Of Sale",
    "author": "Ilyas, Ooops404, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "pos_discount",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_global_discount_in_line/static/src/js/GlobalLineDiscount.js",
        ],
    },
    "data": ["views/res_config_settings_views.xml"],
}
