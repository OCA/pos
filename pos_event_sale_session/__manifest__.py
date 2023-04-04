# Copyright 2021 Moka Tourisme (https://www.mokatourisme.fr).
# @author Iván Todorovich <ivan.todorovich@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Point of Sale Event Sessions",
    "summary": "Sell event sessions from Point of Sale",
    "author": "Moka Tourisme, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "category": "Marketing",
    "version": "15.0.1.0.2",
    "license": "AGPL-3",
    "maintainers": ["ivantodorovich"],
    "depends": ["pos_event_sale", "event_sale_session"],
    "data": [
        "reports/report_pos_order.xml",
        "views/event_session.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_event_sale_session/static/src/js/**/*.js",
        ],
        "web.assets_qweb": [
            "pos_event_sale_session/static/src/xml/**/*.xml",
        ],
        "web.assets_tests": [
            "pos_event_sale_session/static/tests/tours/**/*",
        ],
    },
    "auto_install": True,
}
