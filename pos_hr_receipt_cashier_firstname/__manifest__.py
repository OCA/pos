# Copyright 2026 INVITU (https://www.invitu.com)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "POS HR Receipt Cashier Firstname",
    "summary": "Print only the employee's first name on receipts and kitchen tickets",
    "version": "18.0.1.0.0",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "INVITU, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": ["pos_hr", "hr_employee_firstname"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_hr_receipt_cashier_firstname/static/src/js/**/*",
            "pos_hr_receipt_cashier_firstname/static/src/xml/**/*",
        ],
        "web.assets_tests": [
            "pos_hr_receipt_cashier_firstname/static/tests/tours/**/*",
        ],
    },
    "installable": True,
}
