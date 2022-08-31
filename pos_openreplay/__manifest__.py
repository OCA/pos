# Copyright 2021 KMEE
# License LGPL-3 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Pos OpenReplay",
    "summary": """Point of Sale: Open Replay Integration""",
    "version": "14.0.1.0.0",
    "author": "KMEE, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "maintainers": ["mileo", "ygcarvalh"],
    "depends": [
        "pos_hr",
    ],
    "data": [
        "views/pos_config_view.xml",
        "views/pos_template.xml",
    ],
}
