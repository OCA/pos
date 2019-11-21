# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# Copyright (C) 2017 - Today: Akretion (http://www.akretion.com)
# Copyright (C) 2019 ACSONE SA/NV (<http://acsone.eu>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point of Sale - timeout",
    "summary": "Set the timeout of the point of sale",
    "version": "9.0.1.0.0",
    "category": "Point Of sale",
    "website": "https://odoo-community.org/",
    "author": "GRAP, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "images": [
        "static/description/pos_config.png",
    ],
    "data": [
        "views/view_pos_config.xml",
        "views/templates.xml",
    ],
    "installable": True,
}
