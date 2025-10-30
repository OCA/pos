# SPDX-FileCopyrightText: 2025 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

{
    "name": "Hide POS Refund Button",
    "summary": "Hide the refund button in the TicketScreen",
    "version": "16.0.1.0.0",
    "category": "Uncategorized",
    "website": "https://github.com/OCA/pos",
    "author": "Coop IT Easy SC, Odoo Community Association (OCA)",
    "maintainers": ["mihien"],
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_hide_refund_button/static/src/scss/**/*.scss",
            "pos_hide_refund_button/static/src/xml/**/*.xml",
        ],
    },
}
