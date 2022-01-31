# Copyright (C) 2017 Creu Blanca
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    "name": "POS Session Pay invoice",
    "version": "14.0.1.0.1",
    "category": "Point Of Sale",
    "author": "Creu Blanca, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "summary": "Pay and receive invoices from PoS Session",
    "license": "LGPL-3",
    "depends": ["point_of_sale", "account_cash_invoice"],
    "data": [
        "security/ir.model.access.csv",
        "wizard/pos_box_cash_invoice_out.xml",
        "wizard/pos_box_cash_invoice_in.xml",
        "wizard/cash_invoice_in.xml",
        "views/pos_session.xml",
    ],
}
