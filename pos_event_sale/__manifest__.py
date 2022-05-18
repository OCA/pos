# Copyright 2021 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point of Sale Events",
    "summary": "Sell events from Point of Sale",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "category": "Marketing",
    "version": "13.0.1.0.0",
    "license": "AGPL-3",
    "maintainers": ["ivantodorovich"],
    "depends": ["event_sale", "point_of_sale"],
    "data": [
        "security/security.xml",
        "views/assets.xml",
        "views/event_registration.xml",
        "views/pos_order.xml",
        "views/pos_config.xml",
    ],
    "qweb": ["static/src/xml/*.xml"],
}
