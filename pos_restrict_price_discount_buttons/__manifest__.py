{
    "name": "POS Restrict Price Discount Buttons",
    "summary": "Restrict access to 'Price' and 'Discount' buttons in POS",
    "author": "Cetmix, Odoo Community Association (OCA)",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "maintainers": ["geomer198", "CetmixGitDrone"],
    "depends": ["pos_sale", "pos_hr"],
    "data": [
        "views/res_config_settings_views.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_restrict_price_discount_buttons/static/src/js/Screens/ProductScreen/NumpadWidget.js",  # noqa
        ]
    },
    "license": "AGPL-3",
    "installable": True,
    "auto_install": False,
}
