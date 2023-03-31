# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Screen Lock",
    "summary": """
        If enabled, logs out of POS in case of inactivity after the configured time.""",
    "version": "14.0.1.0.0",
    "license": "AGPL-3",
    "author": "KMEE,Odoo Community Association (OCA)",
    "maintainers": ["felipezago"],
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "data": [
        "views/pos_config_view.xml",
        "views/assets.xml",
    ],
}
