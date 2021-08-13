# Copyright (C) 2021 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point of Sale - Hide Empty Categories",
    "version": "12.0.1.0.2",
    "category": "Point Of Sale",
    "summary": """Hide PoS categories that doesn't have any products""",
    "author": "GRAP, Odoo Community Association (OCA)",
    "maintainers": ["legalsylvain"],
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/assets.xml",
    ],
    "demo": [
        "demo/pos_category.xml",
    ],
}
