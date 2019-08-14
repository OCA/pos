# Copyright 2019 Coop IT Easy SCRLfs
#   Pierrick Brun <pierrick.brun@akretion.com>
{
    "name": "PoS Z Ticket",
    "version": "12.0.1.0.0",
    "summary": "Download a Z ticket as .xls",
    "author": "Coop IT Easy SC, Pierrick Brun, Odoo Community Association (OCA)",
    'website': 'https://github.com/OCA/pos',
    "category": "Point of Sale",
    "license": "AGPL-3",
    "depends": [
        "account_missing_tax",
        "point_of_sale",
        "report_xlsx_helper",
    ],
    "data": ["views/pos_views.xml"],
    "installable": True,
}
