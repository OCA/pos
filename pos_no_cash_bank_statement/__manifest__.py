# Copyright 2021 Akretion France (http://www.akretion.com/)
# @author: Alexis de Lattre <alexis.delattre@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "POS No Cash Bank Statement",
    "version": "14.0.1.0.2",
    "category": "Sales/Point of Sale",
    "license": "AGPL-3",
    "summary": "Generate bank statements for all payment methods, not only cash",
    "author": "Akretion,Odoo Community Association (OCA)",
    "maintainers": ["alexis-via"],
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "data": [
        "views/pos_payment_method.xml",
    ],
    "installable": True,
}
