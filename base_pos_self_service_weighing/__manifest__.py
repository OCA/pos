# SPDX-FileCopyrightText: 2023 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

{
    "name": "Self-Service Weighing Base Module",
    "summary": "Base module to configure a PoS as a self-service weighing station",
    "version": "16.0.1.0.0",
    "category": "Sales/Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Coop IT Easy SC, Odoo Community Association (OCA)",
    "maintainers": [
        "carmenbianca",
        "robinkeunen",
    ],
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/pos_config_view.xml",
        "views/res_config_settings_view.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "base_pos_self_service_weighing/static/src/css/pos.css",
            "base_pos_self_service_weighing/static/src/js/**/*.js",
            "base_pos_self_service_weighing/static/src/xml/**/*.xml",
        ],
    },
}
