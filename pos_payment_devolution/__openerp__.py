# -*- coding: utf-8 -*-
# © 2016 KMEE INFORMATICA LTDA (<http://kmee.com.br>)
# Luiz Felipe do Divino <luiz.divino@kmee.com.br>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point of Sale - Credit of Devolution",
    "version": "8.0.1.0.0",
    "author": "KMEE INFORMATICA LTDA, "
              "Odoo Community Association (OCA)",
    'website': 'http://odoo-brasil.org',
    "license": "AGPL-3",
    "category": "Point Of Sale",
    "depends": [
        'point_of_sale',
        'account',
    ],
    'data': [
        "views/pos_template.xml",
        "views/account_journal.xml",
    ],
    "qweb": [],
    "installable": True,
}
