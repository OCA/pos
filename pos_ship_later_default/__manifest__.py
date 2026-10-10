{
    "name": "POS Ship Later Default",
    "version": "19.0.1.0.0",
    "category": "Sales/Point of Sale",
    "summary": "Set Ship Later by default in Point of Sale",
    "author": "Odoo Community Association (OCA), Jarsa",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": [
        "views/res_config_settings_views.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_ship_later_default/static/src/overrides/**/*",
        ],
        "web.assets_tests": [
            "pos_ship_later_default/static/tests/tours/pos_ship_later_default_tour.esm.js",
        ],
    },
    "installable": True,
}
