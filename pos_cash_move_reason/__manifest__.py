# Copyright 2016 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "POS cash in-out reason",
    "summary": """""",
    "author": "ACSONE SA/NV," "GRAP," "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "category": "Point Of sale",
    "version": "15.0.1.0.0",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": [
        "security/ir_rule.xml",
        "security/res_groups.xml",
        "security/ir.model.access.csv",
        "views/view_pos_move_reason.xml",
        "views/view_pos_session.xml",
        "wizard/wizard_pos_move_reason.xml",
    ],
    "demo": ["demo/account_account.xml", "demo/pos_move_reason.xml"],
}
