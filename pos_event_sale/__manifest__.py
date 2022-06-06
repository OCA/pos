# Copyright 2021 Camptocamp (https://www.camptocamp.com).
# @author Iván Todorovich <ivan.todorovich@camptocamp.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Point of Sale Events",
    "summary": "Sell events from Point of Sale",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "category": "Marketing",
    "version": "15.0.1.0.0",
    "license": "AGPL-3",
    "maintainers": ["ivantodorovich"],
    "depends": ["event_sale", "point_of_sale"],
    "data": [
        "security/security.xml",
        "reports/report_pos_order.xml",
        "views/event_registration.xml",
        "views/event_event.xml",
        "views/pos_order.xml",
        "views/pos_config.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "web/static/lib/fullcalendar/core/main.css",
            "web/static/lib/fullcalendar/daygrid/main.css",
            "web/static/lib/fullcalendar/core/main.js",
            "web/static/lib/fullcalendar/daygrid/main.js",
            "web/static/lib/fullcalendar/interaction/main.js",
            "pos_event_sale/static/src/js/**/*.js",
            "pos_event_sale/static/src/scss/**/*.scss",
        ],
        "web.assets_qweb": [
            "pos_event_sale/static/src/xml/**/*.xml",
        ],
        "web.assets_tests": [
            "pos_event_sale/static/tests/tours/**/*",
        ],
    },
    "post_init_hook": "post_init_hook",
}
