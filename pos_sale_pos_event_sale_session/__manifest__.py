# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Iván Todorovich <ivan.todorovich@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "POS Sale and POS Event Sale Session",
    "summary": "Glue module between pos_sale and pos_event_sale_session",
    "version": "15.0.1.0.0",
    "author": "Moka Tourisme, Odoo Community Association (OCA)",
    "maintainers": ["ivantodorovich"],
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "category": "Marketing",
    "depends": ["pos_sale_pos_event_sale", "pos_event_sale_session"],
    "assets": {
        "point_of_sale.assets": [
            "pos_sale_pos_event_sale_session/static/src/js/**/*.js",
        ],
    },
    "auto_install": True,
}
