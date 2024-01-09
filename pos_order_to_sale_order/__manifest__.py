# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "PoS Order To Sale Order",
    "version": "14.0.1.0.0",
    "author": "GRAP,Odoo Community Association (OCA)",
    "category": "Point Of Sale",
    "license": "AGPL-3",
    "depends": ["point_of_sale", "sale"],
    "maintainers": ["legalsylvain"],
    "development_status": "Production/Stable",
    "website": "https://github.com/OCA/pos",
    "data": ["views/view_pos_config.xml", "views/assets.xml"],
    "qweb": [
        "static/src/xml/CreateOrderButton.xml",
        "static/src/xml/CreateOrderPopup.xml",
    ],
    "installable": True,
}
