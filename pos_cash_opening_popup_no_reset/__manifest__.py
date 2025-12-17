# SPDX-FileCopyrightText: 2025 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

{
    "name": "Cash Opening Popup No Reset",
    "summary": "Disable reset of the total cash to 0 when clicking on the calculator "
    "on the cash opening popup"
    "to 0 when clicking on the calculator",
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
            "pos_cash_opening_popup_no_reset/static/src/js/**/*.js",
        ],
    },
}
