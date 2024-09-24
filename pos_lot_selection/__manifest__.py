# Copyright 2018 Tecnativa S.L. - David Vidal
# Copyright 2022 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "POS Lot Selection",
    "version": "14.0.1.0.0",
    "category": "Point of Sale",
    "author": "Tecnativa, Camptocamp, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": ["templates/assets.xml"],
    "qweb": ["static/src/xml/LotSelectorPopup.xml"],
    "application": False,
    "installable": True,
}
