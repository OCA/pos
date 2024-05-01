# SPDX-FileCopyrightText: 2024 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

{
    "name": "Point of Sale self-service tare labels",
    "summary": """
        Configure a PoS to be a self-service station where customers can weigh
        their empty container and print a tare of their weights.""",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Coop IT Easy SC, Odoo Community Association (OCA)",
    "maintainers": ["carmenbianca", "robinkeunen"],
    "license": "AGPL-3",
    "application": False,
    "depends": [
        "pos_self_service_weighing_base",
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
