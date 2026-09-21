{
    "name": "POS Payment Method Fees",
    "summary": "Models transactional financial fees per POS payment method, "
    "with automatic posting and complete traceability.",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "license": "LGPL-3",
    "author": "BINHEX Systems Solutions S.L., Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": [
        "point_of_sale",
        "account",
    ],
    "data": [
        "security/ir.model.access.csv",
        "views/pos_payment_method_fee_views.xml",
        "views/pos_payment_fee_line_views.xml",
    ],
    "installable": True,
    "application": False,
    "auto_install": False,
}
