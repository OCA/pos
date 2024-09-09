# Copyright (C) 2022-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

{
    "name": "Point of Sale - Receipt Usability",
    "summary": "Improve receipt screen in the PoS front office",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "maintainers": ["legalsylvain"],
    "author": "GRAP,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "assets": {
        "point_of_sale.assets": [
            "pos_receipt_usability/static/src/css/pos_receipt_usability.scss",
            "pos_receipt_usability/static/src/xml/PaymentScreen.xml",
        ],
    },
    "installable": True,
}
