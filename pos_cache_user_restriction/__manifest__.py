# Copyright 2020 Lorenzo Battistini @ TAKOBI
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
{
    "name": "POS Cache - Restrict users",
    "summary": "Allow access to pos cache to restricted users",
    "version": "12.0.1.0.0",
    "development_status": "Beta",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Giovanni Serra, Odoo Community Association (OCA)",
    "maintainers": ["GSLabIt"],
    "license": "LGPL-3",
    "application": False,
    "installable": True,
    "auto_install": True,
    "depends": [
        "pos_user_restriction",
        "pos_cache",
    ],
    "data": [
        "security/ir.model.access.csv",
    ],
}
