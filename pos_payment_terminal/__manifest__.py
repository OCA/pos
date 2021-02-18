# Copyright 2014-2020 Aurélien DUMAINE
# Copyrght 2015-2020 Akretion (http://www.akretion.com/)
# @author: Alexis de Lattre <alexis.delattre@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "POS Payment Terminal",
    "version": "14.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "Point of sale: support generic payment terminal",
    "author": "Aurélien DUMAINE,GRAP,Akretion," "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": [
        "views/pos_payment_method.xml",
        "views/assets.xml",
    ],
    "installable": True,
}
