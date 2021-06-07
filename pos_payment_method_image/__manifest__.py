# Copyright (C) 2019 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Point of Sale - Payment Method Image",
    "summary": "Add images on Payment Method available in the PoS",
    "version": "13.0.1.0.1",
    "category": "Point of Sale",
    "author": "GRAP, Odoo Community Association (OCA)",
    "website": "https://www.github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": ["views/templates.xml", "views/view_pos_payment_method.xml"],
    "qweb": ["static/src/xml/pos_payment_method_image.xml"],
    "images": [
        "static/description/account_payment_method_form.png",
        "static/description/pos_payment.png",
    ],
    "installable": True,
}
