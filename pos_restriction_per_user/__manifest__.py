# Copyright 2026 Tecnativa - Víctor Martínez
{
    "name": "Pos restriction per user",
    "version": "18.0.1.0.0",
    "author": "Odoo, Tecnativa, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "category": "Point Of Sale",
    "depends": ["point_of_sale"],
    "data": [
        "security/ir_rule.xml",
        "views/res_config_settings_views.xml",
    ],
    "installable": True,
    "maintainers": ["victoralmau"],
}
