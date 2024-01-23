# Copyright (C) 2022-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

{
    "name": "Point of Sale - Membership",
    "summary": "Implement features of membership module in the Point of sale UI.",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "maintainers": ["legalsylvain"],
    "author": "GRAP,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale", "membership"],
    "assets": {
        "point_of_sale.assets": [
            "pos_membership/static/src/css/pos_membership.css",
            "pos_membership/static/src/xml/PartnerDetailsEdit.xml",
            "pos_membership/static/src/xml/PartnerLine.xml",
            "pos_membership/static/src/js/PaymentScreen.js",
        ],
    },
    "demo": [
        "demo/res_partner.xml",
    ],
    "installable": True,
}
