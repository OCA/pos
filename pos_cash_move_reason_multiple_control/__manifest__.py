# Copyright (C) 2021-Today: GTRAP (<http://www.grap.coop/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "POS cash in-out reason With multiple control",
    "summary": "Glue module between pos_cash_move_reason"
    " and pos_multiple_control",
    "author": "GRAP,"
              "Odoo Community Association (OCA)",
    "maintainers": ["legalsylvain"],
    "website": "https://github.com/OCA/pos",
    "category": "Point Of sale",
    "version": "12.0.3.1.1",
    "license": "AGPL-3",
    "depends": [
        "pos_cash_move_reason",
        "pos_multiple_control",
    ],
    "data": [
        "wizard/wizard_pos_move_reason.xml",
    ],
    "installable": True,
    "auto_install": True,
}
