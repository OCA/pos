# SPDX-FileCopyrightText: 2024 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

{
    "name": "Self-Service Tare Weighing",
    "summary": "Configure a PoS to be a self-service tare weighing station",
    "version": "16.0.1.0.0",
    "category": "Sales/Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Coop IT Easy SC, Odoo Community Association (OCA)",
    "maintainers": [
        "robinkeunen",
    ],
    "license": "AGPL-3",
    "depends": [
        "base_pos_self_service_weighing",
        "pos_tare",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_self_service_weighing_tare/static/src/js/**/*.js",
            "pos_self_service_weighing_tare/static/src/xml/**/*.xml",
        ],
    },
    "point_of_sale.qunit_suite_tests": [
        "pos_self_service_weighing_tare/static/tests/unit/**/*",
    ],
}
