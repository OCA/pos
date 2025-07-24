{
    "name": "POS Disable Pricelist Selection",
    "summary": "Disable Pricelist selection button in POS",
    "version": "17.0.1.0.0",
    "category": "Point of Sale",
    "author": (
        "Ooops, "
        "Cetmix, "
        "Almas Kopeyev, "
        "IT-Projects LLC, "
        "Odoo Community Association (OCA)"
    ),
    "contributors": ["Cetmix", "Almas Kopeyev"],
    "maintainers": ["ilyasprogrammer"],
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "depends": ["point_of_sale"],
    "data": ["views/pos_config_view.xml"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_disable_pricelist_selection/static/src/**/*",
        ]
    },
    "installable": True,
    "application": False,
}
