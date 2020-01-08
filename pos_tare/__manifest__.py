# Copyright (C) 2015-Today GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point Of Sale - Tare",
    "summary": "Manage Tare in Point Of Sale module",
    "version": "12.0.1.0.0",
    "category": "Point Of Sale",
    "author": "GRAP, "
              "Odoo Community Association (OCA)",
    "maintainers": ["legalsylvain"],
    "website": "https://www.github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": ["views/assets.xml"],
    "qweb": ["static/src/xml/pos_tare.xml"],
    "installable": True,
    "images": ["static/description/pos_tare.png"],
}
