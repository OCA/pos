# SPDX-FileCopyrightText: 2023 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

{
    "name": "Point of Sale weighing self-service base module",
    "summary": """
        Configure a PoS to be a self-service station where customers can weigh
        things. As a base module, this covers primarily the welcome screen and
        some common functionalities.""",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Coop IT Easy SC, Odoo Community Association (OCA)",
    "maintainers": ["carmenbianca", "robinkeunen"],
    "license": "AGPL-3",
    "application": False,
    "depends": [
        "point_of_sale",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_self_service_weighing_base/static/src/css/pos.css",
            "pos_self_service_weighing_base/static/src/js/**/*.js",
            "pos_self_service_weighing_base/static/src/xml/**/*.xml",
        ],
    },
    "data": [
        "views/pos_config_views.xml",
        "views/res_config_settings_views.xml",
    ],
    "demo": [],
}
