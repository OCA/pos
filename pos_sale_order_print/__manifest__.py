# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Point of Sale Print Sales Orders",
    "version": "17.0.1.0.0",
    "category": "Sales/Point of Sale",
    "summary": "Print multiple sale orders in POS",
    "depends": ["point_of_sale", "pos_sale"],
    "website": "https://github.com/OCA/pos",
    "author": "Cetmix, Odoo Community Association (OCA)",
    "images": ["static/description/banner.png"],
    "installable": True,
    "data": ["views/res_config_settings_view.xml"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_sale_order_print/static/src/app/order_management_screen/**/*",
        ],
    },
    "license": "AGPL-3",
}
