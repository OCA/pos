# Copyright 2019 Coop IT Easy SC
# 	    Robin Keunen <robin@coopiteasy.be>
#       Vincent Van Rossem <vincent@coopiteasy.be>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Set Default Product Quantity in POS",
    "version": "12.0.1.0.1",
    "author": "Coop IT Easy SC, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "category": "Point of Sale",
    "summary": """
        When adding an order line in the point of sale, this module sets the
        quantity to a configured default.
    """,
    "depends": ["point_of_sale"],
    "data": [
        "views/pos_config_views.xml",
        "views/uom_category_views.xml",
        "static/src/xml/templates.xml",
    ],
}
