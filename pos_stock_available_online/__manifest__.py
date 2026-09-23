{
    "name": "Point of Sale Stock Available Online",
    "version": "18.0.1.0.0",
    "category": "Sales/Point of Sale",
    "summary": "Show the available quantity of products in the Point of Sale ",
    "depends": [
        "point_of_sale",
        "stock_available",
        "base_automation",
    ],
    "website": "https://github.com/OCA/pos",
    "author": "Cetmix, Odoo Community Association (OCA)",
    "images": ["static/description/banner.png"],
    "installable": True,
    "data": ["views/res_config_settings_view.xml"],
    "assets": {
        # customer_display_assets
        "point_of_sale._assets_pos": [
            "pos_stock_available_online/static/src/app/**/*",
        ],
    },
    "license": "AGPL-3",
}
