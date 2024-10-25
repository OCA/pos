# Copyright 2020 Lorenzo Battistini @ TAKOBI
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
{
    "name": "Point of Sale - Restrict users",
    "summary": "Restrict some users to see and use only certain points of sale",
    "version": "17.0.1.0.0",
    "development_status": "Beta",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "TAKOBI, Odoo Community Association (OCA)",
    "maintainers": ["eLBati"],
    "license": "LGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "security/pos_security.xml",
        "security/ir.model.access.csv",
        "views/pos_config_views.xml",
        "views/point_of_sale_views.xml",
    ],
}
