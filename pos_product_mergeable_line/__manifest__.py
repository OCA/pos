# Copyright (C) 2023-Today: GRAP (<http://www.grap.coop/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point of Sale - Mergeable Lines",
    "summary": "Allows to configure at the product level,"
    " if an order line can be merged or not.",
    "version": "12.0.1.0.2",
    "category": "Point of Sale",
    "author": "GRAP, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "maintainers": ["legalsylvain"],
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/templates.xml",
        "views/view_product_template.xml",
    ],
    "installable": True,
}
