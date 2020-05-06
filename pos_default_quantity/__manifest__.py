# Copyright 2019 Coop IT Easy SCRLfs
# 	    Robin Keunen <robin@coopiteasy.be>
#       Vincent Van Rossem <vincent@coopiteasy.be>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Set Default Product Quantity in POS",
    "version": "12.0.1.0.0",
    "author": "Coop IT Easy SCRLfs",
    "website": "https://coopiteasy.be",
    "license": "AGPL-3",
    "category": "Point of Sale",
    "summary": """
        When adding an to order line, this module sets the quantity to
         the default quantity set on the product unit category.
    """,
    "depends": ["point_of_sale",],
    "data": [
        "views/pos_config.xml",
        "views/product_view.xml",
        "static/src/xml/templates.xml",
    ],
    "installable": True,
}
