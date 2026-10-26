{
    "name": "POS Payment Method Fees",
    "summary": "Record the financial cost of POS bank payment methods "
    "(acquirer and gateway fees) with automatic posting and full traceability.",
    "version": "16.0.1.0.0",
    "category": "Sales/Point of Sale",
    "license": "LGPL-3",
    "author": "BINHEX Systems Solutions S.L., Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "development_status": "Beta",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "security/ir.model.access.csv",
        "security/pos_payment_method_fee_security.xml",
        "views/pos_payment_method_views.xml",
        "views/pos_payment_fee_line_views.xml",
        "views/pos_session_views.xml",
    ],
    "installable": True,
}
