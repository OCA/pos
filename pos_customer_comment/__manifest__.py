# Copyright (C) 2022-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

{
    "name": "Point of Sale - Cashier Comment",
    "summary": "Display Customer comment in the PoS front office and allow"
    " to edit and save it by the cashier",
    "version": "14.0.1.0.0",
    "category": "Point of Sale",
    "maintainers": ["legalsylvain"],
    "author": "GRAP,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": [
        "views/assets.xml",
        "views/view_res_partner.xml",
    ],
    "qweb": [
        "static/src/xml/PartnerDetailsEdit.xml",
        "static/src/xml/PartnerLine.xml",
    ],
    "demo": [
        "demo/res_partner.xml",
    ],
    "installable": True,
}
