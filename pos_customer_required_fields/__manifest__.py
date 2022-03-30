# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Pierre Verkest <pierreverkest84@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Point Of Sale - Customer required fields",
    "summary": "Define customer required field used in PoS order.",
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
        "views/view_pos_config.xml",
    ],
    "qweb": [
        "static/src/xml/pos.xml",
    ],
    "demo": [],
    "installable": True,
}
