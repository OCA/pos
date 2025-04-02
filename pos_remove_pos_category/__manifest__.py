# Copyright (C) 2015-TODAY Akretion (<http://www.akretion.com>).
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "POS Remove POS Category",
    "version": "18.0.1.0.0",
    "author": "Akretion, Camptocamp SA, ACSONE SA/NV, "
    "Odoo Community Association (OCA)",
    "category": "Point of Sale",
    "depends": [
        "point_of_sale",
    ],
    "website": "https://github.com/OCA/pos",
    "data": [
        "views/pos_view.xml",
        "views/pos_category_view.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "/pos_remove_pos_category/static/src/overrides/components/**"
        ],
    },
    "installable": True,
    "license": "AGPL-3",
}
