{
    "name": "Point of Sale Stock Available Online",
    "version": "16.0.2.0.0",
    "category": "Sales/Point of Sale",
    "summary": "Show the available quantity of products in the Point of Sale ",
    "depends": ["point_of_sale", "stock_available", "base_automation"],
    "website": "https://github.com/OCA/pos",
    "author": "Cetmix, Odoo Community Association (OCA)",
    "images": ["static/description/banner.png"],
    "installable": True,
    "data": ["views/res_config_settings_view.xml"],
    "assets": {
        "point_of_sale.assets": [
            "pos_stock_available_online/static/src/css/**/*.css",
            "pos_stock_available_online/static/src/js/**/*.js",
            "pos_stock_available_online/static/src/xml/**/*.xml",
        ],
    },
    "license": "AGPL-3",
}
