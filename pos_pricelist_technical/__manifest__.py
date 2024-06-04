# Copyright (C) 2014 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Point of Sale - Technical Pricelists",
    "summary": "Prevent technical pricelists from being"
    " displayed in the Point of Sale front-end UI",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "author": "GRAP,Odoo Community Association (OCA)",
    "maintainers": ["legalsylvain"],
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale", "sale_pricelist_technical"],
    "assets": {
        "point_of_sale.assets": [
            "pos_pricelist_technical/static/src/js/SetPricelistButton.esm.js",
            "pos_pricelist_technical/static/src/xml/PartnerDetailsEdit.xml",
        ],
    },
    "installable": True,
    "auto_install": True,
}
