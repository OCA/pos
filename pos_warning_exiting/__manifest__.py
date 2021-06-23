# Copyright (C) 2015-Today GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point Of Sale - Warning on Exiting",
    "summary": "Add warning at exiting the PoS front office UI"
    " if there are pending draft orders",
    "version": "14.0.1.0.0",
    "category": "Point Of Sale",
    "author": "GRAP, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": ["views/templates.xml"],
    "images": [
        "static/description/pos_warning_connection_lost.png",
        "static/description/pos_warning_unpaid_draft_orders.png",
    ],
    "installable": True,
}
