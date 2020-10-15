# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError
from odoo.exceptions import Warning as UserError


class PosSession(models.Model):
    _inherit = "pos.session"

    # Columns Section
    statement_ids = fields.One2many(readonly=False)

    control_statement_ids = fields.One2many(
        string="Control statements",
        comodel_name="account.bank.statement",
        related="statement_ids",
    )

    summary_statement_ids = fields.One2many(
        string="Summary statements",
        comodel_name="account.bank.statement",
        related="statement_ids",
    )

    control_register_balance_start = fields.Float(
        compute='_compute_control_register_balance_start',
        string='Opening Balances')

    control_register_total_entry_encoding = fields.Float(
        compute='_compute_control_register_total_entry_encoding',
        string='Transactions')

    control_register_balance_end = fields.Float(
        compute='_compute_control_register_balance_end',
        string='Theoretical Closing Balances')

    control_register_balance = fields.Float(
        compute='_compute_control_register_balance',
        string='Real Closing Balances')

    control_register_difference = fields.Float(
        compute='_compute_control_register_difference',
        string='Total difference')

    # Compute Section
    @api.multi
    @api.depends('statement_ids.is_pos_control', 'statement_ids.balance_start')
    def _compute_control_register_balance_start(self):
        for session in self:
            session.control_register_balance_start = sum(
                session.statement_ids.filtered(
                    lambda x: x.is_pos_control).mapped('balance_start'))

    @api.multi
    @api.depends(
        'statement_ids.is_pos_control', 'statement_ids.total_entry_encoding')
    def _compute_control_register_total_entry_encoding(self):
        for session in self:
            session.control_register_total_entry_encoding = sum(
                session.statement_ids.filtered(
                    lambda x: x.is_pos_control).mapped('total_entry_encoding'))

    @api.multi
    @api.depends(
        'statement_ids.is_pos_control', 'statement_ids.balance_end_real')
    def _compute_control_register_balance_end(self):
        for session in self:
            session.control_register_balance_end = sum(
                session.statement_ids.filtered(
                    lambda x: x.is_pos_control).mapped('balance_end'))

    @api.multi
    @api.depends(
        'statement_ids.is_pos_control', 'statement_ids.control_balance')
    def _compute_control_register_balance(self):
        for session in self:
            session.control_register_balance = sum(
                session.statement_ids.filtered(
                    lambda x: x.is_pos_control).mapped('control_balance'))

    @api.multi
    @api.depends(
        'statement_ids.is_pos_control', 'statement_ids.control_difference')
    def _compute_control_register_difference(self):
        for session in self:
            session.control_register_difference = sum(
                session.statement_ids.filtered(
                    lambda x: x.is_pos_control).mapped('control_difference'))

    # Model
    @api.multi
    def open_cashbox_opening(self):
        return super(PosSession, self).open_cashbox()

    @api.multi
    def action_pos_session_new_session(self):
        return self.config_id.open_new_session(False)

    @api.multi
    def wkf_action_closing_control(self):
        for session in self:
            draft_orders = session.order_ids.filtered(
                lambda x: x.state == "draft"
            )
            if len(draft_orders):
                raise UserError(
                    _(
                        "You can not end this session because there are some"
                        " draft orders: \n\n- %s"
                    )
                    % ("\n- ".join([x.name for x in draft_orders]))
                )
        return super(PosSession, self).wkf_action_closing_control()

    # Overwrite functions
    @api.multi
    def action_pos_session_closing_control(self):
        # Doesn't check balance before validate pos.session
        for session in self:
            session.write({'state': 'closing_control',
                           'stop_at': fields.Datetime.now()})
            if not session.config_id.cash_control:
                session.action_pos_session_close()

    @api.multi
    def action_pos_session_validate(self):
        for session in self:
            for statement in session.statement_ids:
                if statement.journal_id.pos_control is True:
                    if abs(statement.control_difference) > 0.001:
                        raise UserError(
                            _(
                                "You can not close this session because the "
                                "journal %s (from %s) has a not null "
                                "difference: %s%s \n You have to change his "
                                "starting or ending balance"
                            )
                            % (statement.journal_id.name, statement.name,
                               str(round(statement.control_difference, 3)),
                               statement.currency_id.symbol)
                        )
        return super(PosSession, self).action_pos_session_validate()

    # Constraints
    @api.multi
    @api.constrains('user_id', 'state')
    def _check_unicity(self):
        for session in self:
            domain = [
                ("state", "in", ["opening_control", "opened"]),
                ("user_id", "=", session.user_id.id),
            ]
            if self.search_count(domain) > 1:
                raise ValidationError(
                    _(
                        "You cannot create two active sessions "
                        "with the same responsible!"
                    )
                )

    @api.multi
    @api.constrains('config_id', 'state')
    def _check_pos_config(self):
        for session in self:
            domain = [
                ("state", "in", ["opening_control", "opened"]),
                ("config_id", "=", session.config_id.id),
            ]
            if self.search_count(domain) > 1:
                raise ValidationError(
                    _(
                        "You cannot create two active sessions related"
                        " to the same point of sale!"
                    )
                )
