# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Pierre Verkest <pierreverkest84@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Point Of Sale - POS order ZIP Code",
    "summary": (
        "Collect customer zip code in POS order to determine "
        "the catchment area."
    ),
    "version": "12.0.1.0.0",
    "category": "Point of Sale",
    "author": "Pierre Verkest, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "maintainers": [
        "petrus-v",
    ],
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "templates/assets.xml",
        "views/pos_order.xml",
        "views/view_pos_config.xml",
    ],
    "qweb": [
        "static/src/xml/pos.xml",
    ],
    "demo": [],
    "installable": True,
}
