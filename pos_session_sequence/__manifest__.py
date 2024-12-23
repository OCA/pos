# Copyright 2024 Antoni Marroig(APSL-Nagarro)<amarroig@apsl.net>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "POS Session Sequence",
    "summary": "Generates a sequence of POS sessions",
    "version": "17.0.1.0.0",
    "category": "Uncategorized",
    "website": "https://github.com/OCA/pos",
    "author": "Antoni Marroig, APSL-Nagarro, Odoo Community Association (OCA)",
    "maintainers": ["peluko00"],
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/res_config_settings_views.xml",
    ],
    "demo": [
        "demo/pos_session_sequence.xml",
    ],
}
