# SPDX-FileCopyrightText: 2025 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

{
    "name": "Point of Sale - Membership Delegated Partner",
    "summary": "Delegate membership to a specific partner in the point of sale UI",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Coop IT Easy SC, Odoo Community Association (OCA)",
    "maintainers": ["flaenen"],
    "license": "AGPL-3",
    "depends": ["pos_membership", "membership_delegated_partner"],
    "assets": {
        "point_of_sale.assets": [
            "pos_membership_delegated_partner/static/src/css/*.css",
            "pos_membership_delegated_partner/static/src/js/**/*.js",
            "pos_membership_delegated_partner/static/src/xml/**/*.xml",
        ],
    },
}
