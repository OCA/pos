{
    "name": "POS - Blind Session Closing",
    "version": "18.0.1.0.0",
    "summary": "Hide cash control details in the closing popup",
    "category": "Point of Sale",
    "author": "APSL-Nagarro, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "maintainers": ["BernatObrador"],
    "depends": ["point_of_sale"],
    "data": [
        "security/security.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_blind_session_closing/static/src/**/*",
        ],
        "web.assets_tests": [
            "pos_blind_session_closing/static/tests/tours/pos_blind_session_closing_tour.esm.js",
        ],
    },
}
