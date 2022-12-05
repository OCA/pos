# -*- coding: utf-8 -*-
# Copyright 2017 Akretion (http://www.akretion.com).
# @author Raphaël Reverdy <raphael.reverdy@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "POS Backend Customer",
    "summary": "Choose point of sale customers in backend",
    "version": "10.0.1.0.2",
    "category": "Point of sale",
    "website": "https://github.com/OCA/pos",
    'author': "Akretion,Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "application": False,
    'installable': True,
    "depends": [
        "pos_backend_communication",
    ],
    "data": [
        'views/assets.xml',
        'views/backend_partner.xml',
    ],
}
