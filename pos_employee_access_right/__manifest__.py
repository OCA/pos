# Copyright 2022 KMEE
# License LGPL-3 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Pos Employee Acess Right",
    "summary": """Point of Sale: Check access rights at POS features""",
    "version": "14.0.1.0.0",
    "author": "KMEE, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "depends": [
        "pos_hr",
    ],
    "data": [
        "security/ir.model.access.csv",
        "views/access_menu.xml",
        "views/pos_component_security.xml",
        "views/pos_employee_access_security.xml",
        "views/assets.xml",
    ],
}
