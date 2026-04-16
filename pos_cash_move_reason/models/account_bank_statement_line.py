# Copyright (C) 2026-Today: GTRAP (<https://www.grap.coop/>)
# @author: Quentin DUPONT
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class AccountBankStatementLine(models.Model):
    _inherit = "account.bank.statement.line"

    pos_move_reason = fields.Many2one(comodel_name="pos.move.reason")
