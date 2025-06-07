# SPDX-FileCopyrightText: 2025 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

{
    "name": "Self-Service Product Weighing",
    "summary": "Configure a PoS to be a self-service product weighing station",
    "version": "16.0.1.0.0",
    "category": "Sales/Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Coop IT Easy SC, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": [
        "base_pos_self_service_weighing",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_self_service_weighing_product/static/src/js/**/*.js",
            "pos_self_service_weighing_product/static/src/xml/**/*.xml",
        ],
        "point_of_sale.qunit_suite_tests": [
            "pos_self_service_weighing_product/static/tests/unit/**/*",
        ],
    },
}
