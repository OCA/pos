# SPDX-FileCopyrightText: 2021 Coop IT Easy SC
# SPDX-FileContributor: Grégoire Leeuwerck <gregoire@coopiteasy.be>
# SPDX-FileContributor: Vincent Van Rossem <vincent@coopiteasy.be>
#
# SPDX-License-Identifier: AGPL-3.0-or-later

{
    "name": "Self-Service Weighing ZPL Print Driver",
    "summary": "ZPL print driver for the self-service weighing station",
    "version": "16.0.1.0.0",
    "category": "Sales/Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Coop IT Easy SC, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": [
        "base_pos_self_service_weighing",
    ],
    "data": [
        "views/res_config_settings_view.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_self_service_weighing_print_zpl/static/lib/browser_ipp/dist/browser_ipp.js",
            "pos_self_service_weighing_print_zpl/static/src/js/**/*.js",
        ],
    },
}
