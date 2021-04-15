# Copyright 2018-21 ForgeFlow S.L. (https://www.forgeflow.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Pos Payment Method",
    "summary": """
        This module adds the Pos Payment Method model to add support for
        different payment methods in the PoS""",
    "version": "12.0.1.0.0",
    "license": "AGPL-3",
    "author": "ForgeFlow S.L.,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": [
        "point_of_sale"
    ],
    "data": [
        "views/account_journal.xml",
        "views/assets.xml",
    ],
    "qweb": ["static/src/xml/pos_payment_method.xml"],
}
