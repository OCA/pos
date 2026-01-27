# SPDX-FileCopyrightText: 2017 - 2020 BEES coop SCRLfs
# SPDX-FileContributor: Elouan Lebars <elouan@coopiteasy.be>
# SPDX-FileContributor: Rémy Taymans <remy@coopiteasy.be>
# SPDX-FileContributor: Vincent Van Rossem <vincent@coopiteasy.be>
# SPDX-FileContributor: Elise Dupont
# SPDX-FileContributor: Thibault François
# SPDX-FileContributor: Grégoire Leeuwerck
# SPDX-FileContributor: Houssine Bakkali <houssine@coopiteasy.be>
#
# SPDX-License-Identifier: AGPL-3.0-or-later

{
    "name": "POS - Hide Partner Info",
    "summary": "Hide phone and address fields in PoS customer list",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "BEES coop - Cellule IT, Coop IT Easy SC, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_hide_partner_info/static/src/xml/**/*.xml",
        ],
    },
}
