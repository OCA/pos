# Copyright 2020 Akretion (https://www.akretion.com).
# @author Raphaël Reverdy <raphael.reverdy@akretion.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).


{
    "name": "POS Require Customer",
    "summary": "Block pos order with no customer set",
    "version": "14.0.1.0.0",
    "category": "Point of sale",
    "website": "https://github.com/OCA/pos",
    "author": "Akretion,Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "templates/assets.xml",
        "views/product_pricelist.xml",
    ],
    "demo": [],
    "qweb": [],
}
