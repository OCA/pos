{
    "name": "Pos Loyalty Redeem Payment",
    "summary": "Use vouchers as payment method in pos orders",
    "category": "Point Of Sale & Sales",
    "version": "16.0.1.0.0",
    "website": "https://github.com/OCA/pos",
    "author": "Odoo Community Association (OCA), FactorLibre",
    "application": False,
    "depends": [
        "pos_loyalty",
    ],
    "data": [
        "views/pos_payment_method_views.xml",
        "views/loyalty_program_views.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_loyalty_redeem_payment/static/src/js/**/*",
            "pos_loyalty_redeem_payment/static/src/xml/**/*",
            "pos_loyalty_redeem_payment/static/src/scss/responsive_number_popup.scss",
        ],
        "web.assets_tests": [
            "pos_loyalty_redeem_payment/static/tests/tours/**/*",
        ],
    },
    "installable": True,
    "license": "LGPL-3",
}
