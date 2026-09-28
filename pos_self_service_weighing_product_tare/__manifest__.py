# SPDX-FileCopyrightText: 2025 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

{
    "name": "Tare Support for Self-Service Product Weighing",
    "summary": "Deduct tare weight in the self-service product weighing station",
    "version": "16.0.1.0.0",
    "category": "Hidden",
    "website": "https://github.com/OCA/pos",
    "author": "Coop IT Easy SC, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": [
        "pos_self_service_weighing_product",
        "pos_tare",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_self_service_weighing_product_tare/static/src/js/**/*.js",
            "pos_self_service_weighing_product_tare/static/src/xml/**/*.xml",
        ],
    },
    "auto_install": True,
}
