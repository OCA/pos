# Copyright 2022 - Today Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point of Sale - Cashback",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "author": "GRAP, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "maintainers": ["legalsylvain"],
    "depends": ["point_of_sale"],
    "assets": {
        "point_of_sale.assets": [
            "pos_cashback/static/src/js/models.esm.js",
            "pos_cashback/static/src/xml/PaymentScreen/PaymentScreenStatus.xml",
            "pos_cashback/static/src/scss/pos_cashback.scss",
        ],
    },
    "installable": True,
}
