# Copyright (C) 2014 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Point of Sale - Technical Pricelists",
    "summary": "Prevent technical pricelists from being"
    " displayed in the Point of Sale front-end UI",
    "version": "12.0.1.0.1",
    "category": "Point of Sale",
    "author": "GRAP,Odoo Community Association (OCA)",
    "maintainers": ["legalsylvain"],
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
        "sale_pricelist_technical",
    ],
    "data": [
        "views/templates.xml",
    ],
    "qweb": [
        "static/src/xml/pos_pricelist_technical.xml",
    ],
    "images": [
        "static/description/pos_front_end_ui.png",
        "static/description/pos_config_form.png",
    ],
    "demo": [
        "demo/pos_config.xml",
    ],

    "installable": True,
    "auto_install": True,
}
