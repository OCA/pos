# SPDX-FileCopyrightText: 2025 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

{
    "name": "PoS Donation",
    "summary": "Generate donation for donation sold in PoS",
    "version": "16.0.1.0.0",
    "category": "Sales/Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Coop IT Easy SC, Odoo Community Association (OCA)",
    "maintainers": ["remytms"],
    "license": "AGPL-3",
    "depends": [
        "donation",
        "point_of_sale",
    ],
    "data": [
        "security/ir.model.access.csv",
        "views/donation_views.xml",
        "views/product_template_views.xml",
    ],
    "demo": [
        "demo/donation.xml",
    ],
}
