# Copyright 2025 Tecnativa - Pedro M. Baeza
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Keep sale pickings from PoS",
    "version": "18.0.1.0.2",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "maintainers": ["pedrobaeza"],
    "license": "AGPL-3",
    "installable": True,
    "depends": ["pos_sale"],
    "assets": {
        "web.assets_tests": [
            "pos_sale_picking_keep/static/tests/tours/**/*",
        ],
    },
}
