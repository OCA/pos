{
    "name": "Point of Sale - Full Refund",
    "summary": "Add button to easily perform full refunds in Point of Sale",
    "author": "Innovyou, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "development_status": "Alpha",
    "category": "Point of sale",
    "maintainers": ["LorenzoC0"],
    "version": "18.0.1.0.0",
    "license": "AGPL-3",
    "installable": True,
    "depends": ["point_of_sale"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_full_refund/static/src/js/TicketScreen.esm.js",
            "pos_full_refund/static/src/xml/pos_full_refund.xml",
        ],
        "web.assets_tests": [
            "pos_full_refund/static/tests/tours/PosFullRefund.tour.esm.js",
        ],
    },
}
