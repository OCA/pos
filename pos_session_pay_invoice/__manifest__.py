# -*- coding: utf-8 -*-
# Copyright (C) 2017 Creu Blanca
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    'name': 'POS Session Pay invoice',
    'version': '11.0.1.0.0',
    'category': 'Point Of Sale',
    'author': "Creu Blanca,"
              "Odoo Community Association (OCA)",
    'website': 'https://github.com/OCA/pos',
    'summary': 'Pay and receive invoices from PoS Session',
    "license": "LGPL-3",
    'depends': [
        "point_of_sale", "account_cash_invoice"
    ],
    'data': [
        "wizard/cash_invoice_out.xml",
        "wizard/cash_invoice_in.xml",
        "views/pos_session.xml",
    ],
}
