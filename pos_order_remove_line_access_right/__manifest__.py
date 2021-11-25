# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "POS Order Remove Line Access Rights",
    "version": "14.0.1.0.1",
    "category": "Point Of Sale",
    "summary": "Point of Sale - Extra Access Right for certain actions",
    "author": " Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["pos_access_right"],
    "data": [
        "security/res_groups.xml",
        "views/templates.xml",
    ],
    "demo": [
        "demo/res_groups.xml",
    ],
    "qweb": [
        "static/src/xml/*.xml",
    ],
    "installable": True,
}
