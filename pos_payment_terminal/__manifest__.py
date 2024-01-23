# Copyright 2014-2020 Aurélien DUMAINE
# Copyrght 2015-2020 Akretion (http://www.akretion.com/)
# @author: Alexis de Lattre <alexis.delattre@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "POS Payment Terminal",
    "version": "16.0.1.0.2",
    "category": "Point Of Sale",
    "summary": "Point of sale: support generic payment terminal",
    "author": (
        "Aurélien DUMAINE,"
        "GRAP,"
        "Akretion,"
        "ACSONE SA/NV,"
        "Odoo Community Association (OCA)"
    ),
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": [
        "views/pos_payment_method.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_payment_terminal/static/src/js/payment_terminal.js",
            "pos_payment_terminal/static/src/js/models.js",
        ],
    },
    "installable": True,
}
