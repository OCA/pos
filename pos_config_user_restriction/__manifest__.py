# Copyright 2026 Saad Elbahi
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "POS Config User Restriction",
    "summary": "Restrict POS users and managers to assigned POS configurations",
    "version": "18.0.1.0.0",
    "category": "Sales/Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Saad Elbahi, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "development_status": "Beta",
    "maintainers": ["saadhp"],
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "security/pos_config_user_restriction_security.xml",
        "views/res_users_views.xml",
    ],
    "installable": True,
}
