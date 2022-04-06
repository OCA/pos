# Copyright (C) 2022 - Today: camptocamp (https://www.camptocamp.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "PoS Hide Cost and Margin",
    "summary": "Hide Cost and Margin on PoS",
    "version": "15.0.1.0.1",
    "category": "Point Of Sale",
    "author": "CampToCamp, Odoo Community Association (OCA)",
    "maintainers": [],
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [],
    "assets": {
        "web.assets_qweb": [
            "pos_hide_cost_price_and_margin/static/src/xml/pos_margin.xml",
        ],
    },
    "installable": True,
}
