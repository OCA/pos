# Copyright 2022 KMEE (<http://www.kmee.com.br>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "POS Reason to Cancel",
    "summary": """""",
    "author": "KMEE," "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "category": "Point Of sale",
    "version": "14.0.1.0.0",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
        "pos_hr",
    ],
    "data": [
        "security/ir.model.access.csv",
        "views/assets.xml",
        "views/audit_menu.xml",
        "views/pos_cancel_reason.xml",
        "views/pos_config.xml",
        "views/pos_order_line_cancelled.xml",
        "views/pos_order.xml",
    ],

    "demo": [],
}
