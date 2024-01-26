# Copyright (C) 2023-Today: GRAP (<http://www.grap.coop/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point of Sale - Mergeable Lines",
    "summary": "Allows to configure at the product level,"
    " if an order line can be merged or not.",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "author": "GRAP, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "maintainers": ["legalsylvain"],
    "depends": ["point_of_sale"],
    "data": ["views/view_product_template.xml"],
    "assets": {
        "point_of_sale.assets": [
            "pos_product_mergeable_line/static/src/js/models.js",
        ],
    },
    "installable": True,
}
