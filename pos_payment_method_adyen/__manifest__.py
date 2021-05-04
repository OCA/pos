# Copyright 2018-21 ForgeFlow S.L. (https://www.forgeflow.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Pos Payment Adyen",
    "summary": """
        This module adds support to Adyen payment method in the PoS""",
    "version": "12.0.1.0.0",
    "license": "AGPL-3",
    "author": "ForgeFlow S.L.,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": [
        "pos_payment_method"
    ],
    "data": [
        "data/ir_cron.xml",
        "views/account_journal_views.xml",
        "views/pos_config_views.xml",
        "views/assets.xml",
    ],
    "qweb": [
        "static/src/xml/pos.xml",
    ],
}
