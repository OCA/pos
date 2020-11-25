# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# @author Quentin DUPONT (quentin.dupont@grap.coop)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, api, fields, models
from odoo.exceptions import Warning as UserError
import odoo.addons.decimal_precision as dp


class AccountBankStatement(models.Model):
    _inherit = "account.bank.statement"

    # Columns Section
    control_balance = fields.Float(
        string="Controled Balance",
        compute="_compute_control_balance",
        digits=dp.get_precision('Account'),
    )

    control_difference = fields.Float(
        string="Control Difference",
        compute="_compute_control_difference",
        digits=dp.get_precision('Account'),
    )

    is_pos_control = fields.Boolean(
        string="Pos control Bank statement",
        compute="_compute_is_pos_control", store=True,
    )

    pos_session_state = fields.Char(
        string="Pos session state", compute="_compute_pos_session_state"
    )

    display_autosolve = fields.Boolean(
        string="Display autosolve", compute="_compute_display_autosolve"
    )

    cashbox_starting = fields.Many2one(
        comodel_name="account.bank.statement.cashbox",
        string="Cashbox start",
    )

    cashbox_ending = fields.Many2one(
        comodel_name="account.bank.statement.cashbox",
        string="Cashbox end",
    )

    # Compute Section
    @api.multi
    @api.depends("line_ids")
    def _compute_control_balance(self):
        for statement in self:
            statement.control_balance = sum(
                statement.mapped("balance_end_real")
            )

    @api.multi
    @api.depends("control_balance", "total_entry_encoding", "balance_end_real")
    def _compute_control_difference(self):
        for statement in self:
            statement.control_difference = (
                + statement.balance_end_real
                - statement.balance_start
                - statement.total_entry_encoding
            )

    @api.multi
    @api.depends("journal_id.pos_control", "pos_session_state",
                 "balance_start")
    def _compute_is_pos_control(self):
        for statement in self:
            journal = statement.journal_id
            statement.is_pos_control = journal.pos_control

    @api.multi
    @api.depends("pos_session_id.state")
    def _compute_pos_session_state(self):
        for statement in self:
            statement.pos_session_state = statement.pos_session_id.state

    # Display button autosolve with some conditions
    @api.multi
    def _compute_display_autosolve(self):
        for statement in self:
            if not statement.journal_id.pos_control:
                statement.display_autosolve = False
            else:
                if statement.pos_session_id.config_id.autosolve_limit:
                    difference_with_limit = (
                        abs(statement.control_difference)
                        - statement.pos_session_id.config_id.autosolve_limit
                    )
                else:
                    difference_with_limit = -1
                statement.display_autosolve = (
                    statement.pos_session_state not in
                    ["closed"]
                    and difference_with_limit < 0
                    and abs(round(statement.control_difference, 3)) != 0
                )

    @api.multi
    @api.depends("pos_session_state")
    def automatic_solve(self):
        self.WizardReason = self.env['wizard.pos.move.reason']
        for statement in self:
            pos_move_reason = statement.\
                pos_session_id.config_id.autosolve_pos_move_reason
            if pos_move_reason:
                cb_pos_move_reason_id = pos_move_reason.id
                cb_difference = statement.control_difference
                cb_journal_id = statement.journal_id.id
                cb_journal_name = statement.journal_id.name
                if cb_difference < 0:
                    default_move_type = "expense"
                else:
                    default_move_type = "income"

                wizard = self.WizardReason.with_context(
                    active_id=statement.pos_session_id.id,
                    default_move_type=default_move_type).create({
                        'move_reason_id': cb_pos_move_reason_id,
                        'journal_id': cb_journal_id,
                        'statement_id': statement.id,
                        'amount': abs(cb_difference),
                        'name': _('Automatic solve %s') % cb_journal_name,
                    })
                wizard.apply()

            else:
                raise UserError(
                    _(
                        "We can't autosolve this difference. \nYou need to "
                        "configure the Point Of Sale config and choose a "
                        "pos move reason for autosolving this difference."
                    )
                )

    def open_cashbox_starting_balance(self):
        return self.open_cashbox_balance('starting')

    def open_cashbox_ending_balance(self):
        return self.open_cashbox_balance('ending')

    def open_cashbox_balance(self, balance_moment):
        action = self.env.ref(
            "pos_multiple_control."
            "action_wizard_update_bank_statement").read()[0]
        action['context'] = {'balance_moment': balance_moment,
                             'active_id': [self.id],
                             'active_pos_id': [self.pos_session_id.id],
                             'active_model': 'pos.session'}
        return action
