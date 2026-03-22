{
    "name": "POS Offline",
    "summary": "Full offline capability for Point of Sale",
    "version": "18.0.1.0.0",
    "development_status": "Beta",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "KMEE, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "pos_pwa",
    ],
    "data": [
        "views/pos_config_views.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_offline/static/src/js/data_service_patch.esm.js",
            "pos_offline/static/src/js/data_service_options_patch.esm.js",
            "pos_offline/static/src/js/pos_store_patch.esm.js",
            "pos_offline/static/src/js/payment_screen_patch.esm.js",
            "pos_offline/static/src/js/barcode_reader_patch.esm.js",
        ],
    },
}
