# Copyright 2020 ForgeFlow, S.L.
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
from odoo import api, fields, models, _
from odoo.exceptions import UserError


class WizardUpdateBankStatement(models.TransientModel):
    _name = "wizard.update.bank.statement"
    _description = 'POS Update Bank Statement Balance'

    def _default_session_id(self):
        return self.env.context.get('active_pos_id', False)

    statement_id = fields.Many2one(
        comodel_name='account.bank.statement',
    )
    name = fields.Char(
        related='statement_id.name'
    )
    journal_id = fields.Many2one(
        comodel_name='account.journal',
        related='statement_id.journal_id',
    )
    balance_start = fields.Monetary(
        string="Starting Balance",
        default=0.0,
        compute='_compute_balance_start'
    )
    balance_start_real = fields.Monetary(
        string="Real Start Balance",
        default=0.0,
        compute='_compute_balance_start_real',
    )
    total_entry_encoding = fields.Monetary(
        related='statement_id.total_entry_encoding',
    )
    balance_end = fields.Monetary(
        string="Computed Balance",
        default=0.0,
        compute='_compute_balance_end'
    )
    balance_end_real = fields.Monetary(
        string="Real End Balance",
        default=0.0,
        compute='_compute_balance_end_real',
    )
    currency_id = fields.Many2one(
        comodel_name='res.currency',
        related='statement_id.currency_id'
    )

    _BALANCE_MOMENT_SELECTION = [
        ('bydefault', 'Default'),
        ('starting', 'Starting balance'),
        ('ending', 'Ending balance'),
    ]

    balance_moment = fields.Selection(
        selection=_BALANCE_MOMENT_SELECTION, string='Balance moment',
        default='bydefault')

    session_id = fields.Many2one(
        comodel_name='pos.session', string="Current Session",
        default=_default_session_id, required=True, readonly=True)

    def _compute_balance_start(self):
        for rec in self:
            rec.balance_start = rec.statement_id.balance_start

    def _compute_balance_end(self):
        for rec in self:
            rec.balance_end = rec.statement_id.balance_end

    @api.multi
    @api.depends('cashbox_lines.subtotal')
    def _compute_balance_end_real(self):
        balance_end_real = 0.0
        for cashbox_lines in self.cashbox_lines:
            if cashbox_lines.balance_moment == 'ending':
                balance_end_real += cashbox_lines.subtotal
        self.balance_end_real = balance_end_real
        # Write in context for xml readonly field
        context = self.env.context.copy()
        context.update({'balance_end_real': balance_end_real})
        self.env.context = context
        return balance_end_real

    @api.multi
    @api.depends('cashbox_lines.subtotal')
    def _compute_balance_start_real(self):
        balance_start_real = 0.0
        for cashbox_lines in self.cashbox_lines:
            if cashbox_lines.balance_moment == 'starting':
                balance_start_real += cashbox_lines.subtotal
        self.balance_start_real = balance_start_real
        # Write in context for xml readonly field
        context = self.env.context.copy()
        context.update({'balance_start_real': balance_start_real})
        self.env.context = context
        return balance_start_real

    @api.model
    def _prepare_item(self, statement):
        return {
            "statement_id": statement.id,
            "name": statement.name,
            "journal_id": statement.journal_id.id,
            "balance_start": statement.balance_start,
            "balance_end": statement.balance_end,
            "total_entry_encoding": statement.total_entry_encoding,
            "currency_id": statement.currency_id.id,
        }

    @api.model
    def default_get(self, flds):
        res = super().default_get(flds)
        # Load objects
        session_obj = self.env["pos.session"]
        bank_statement_obj = self.env["account.bank.statement"]
        # Load context
        active_ids = self.env.context["active_id"] or []
        active_pos_id = self.env.context["active_pos_id"] or []
        active_model = self.env.context["active_model"] or []
        balance_moment = self.env.context["balance_moment"] or []
        # Check propagation
        if not active_pos_id:
            return res
        assert active_model == "pos.session", \
            "Bad context propagation"
        if len(active_pos_id) > 1:
            raise UserError(_('You cannot start the closing '
                              'balance for multiple POS sessions'))
        # Add bank statement lines
        session = session_obj.browse(active_pos_id[0])
        bank_statement = bank_statement_obj.browse(active_ids[0])
        # Give values for wizard
        res["session_id"] = session.id
        res["statement_id"] = bank_statement.id
        res["name"] = bank_statement.name
        res["balance_start"] = bank_statement.balance_start
        res["balance_end"] = bank_statement.balance_end
        res["balance_moment"] = balance_moment
        res["total_entry_encoding"] = bank_statement.total_entry_encoding
        res["currency_id"] = bank_statement.currency_id.id
        res["journal_id"] = bank_statement.journal_id.id
        res["cashbox_lines"] = self._get_cashbox_lines(balance_moment)
        return res

    @api.model
    def _prepare_cashbox_lines(self, line):
        return {
            "coin_value": line.coin_value,
            "number": line.number,
            "subtotal": line.subtotal,
            "balance_moment": line.balance_moment,
        }

    @api.model
    def _default_cashbox_lines(self):
        self._get_cashbox_lines('bydefault')

    @api.model
    def _get_cashbox_lines(self, moment):
        # Load objects and context
        active_ids = self.env.context["active_id"] or []
        bk_st_obj = self.env["account.bank.statement"]
        bk_st = bk_st_obj.browse(active_ids[0])
        cashbox_default = bk_st.journal_id.cashbox_default
        items = []
        if moment == 'starting':
            cashbox_lines = bk_st.cashbox_starting.cashbox_lines_ids
            if not cashbox_lines and cashbox_default:
                for line in cashbox_default.cashbox_lines_ids:
                    items.append([0, 0, self._prepare_cashbox_lines(line)])
            else:
                for line in bk_st.cashbox_starting.cashbox_lines_ids:
                    items.append([0, 0, self._prepare_cashbox_lines(line)])
        elif moment == 'ending':
            cashbox_lines = bk_st.cashbox_ending.cashbox_lines_ids
            if not cashbox_lines and cashbox_default:
                for line in cashbox_default.cashbox_lines_ids:
                    items.append([0, 0, self._prepare_cashbox_lines(line)])
            else:
                for line in bk_st.cashbox_ending.cashbox_lines_ids:
                    items.append([0, 0, self._prepare_cashbox_lines(line)])
        return items

    cashbox_lines = fields.One2many(
        comodel_name='wizard.update.cashbox.line',
        default=_default_cashbox_lines,
        inverse_name='wiz_id')

    @api.model
    def _prepare_cash_box_journal(self, item):
        return {
            'amount': abs(item.difference),
            'name': _('Out'),
            "journal_id": item.journal_id.id,
        }

    def _create_cashbox(self, cashbox_lines):
        # load object
        cashbox_obj = self.env["account.bank.statement.cashbox"]
        cashbox_line_obj = self.env["account.cashbox.line"]
        # create new account.bank.statement.cashbox each time
        cashbox = cashbox_obj.create({})
        # Add the account.cashbox.line
        for line in self.cashbox_lines:
            cashbox_line_obj.create({
                'coin_value': line['coin_value'],
                'number': line['number'],
                'subtotal': line['subtotal'],
                'cashbox_id': cashbox.id})
        return cashbox

    @api.multi
    def action_confirm(self):
        self.ensure_one()
        # load context
        active_ids = self.env.context["active_id"] or []
        bank_statement_obj = self.env["account.bank.statement"]
        bank_statement = bank_statement_obj.browse(active_ids[0])
        # create new cashbow with cashbox_lines
        cashbox = self._create_cashbox(self.cashbox_lines)
        if self.balance_moment == 'starting':
            # record new values for wizard
            self.statement_id.balance_start = self.balance_start_real
            # record cashbox for account_bank_statement
            bank_statement.write({'cashbox_starting': cashbox.id})
        elif self.balance_moment == 'ending':
            self.statement_id.balance_end_real = self.balance_end_real
            bank_statement.write({'cashbox_ending': cashbox.id})
        return True


class WizardUpdateCashboxLine(models.TransientModel):
    _name = 'wizard.update.cashbox.line'
    _description = 'POS Update Bank Statement Balance Wizard Line'

    @api.one
    @api.depends('coin_value', 'number')
    def _sub_total(self):
        self.subtotal = self.coin_value * self.number

    balance_moment = fields.Selection(
        string='Balance moment',
        related="wiz_id.balance_moment")
    coin_value = fields.Float(
        string='Coin/Bill Value',
        required=True, digits=0)
    number = fields.Integer(
        string='Number of Coins/Bills',
        help='Opening Unit Numbers', default=1)
    subtotal = fields.Float(
        compute='_sub_total',
        string='Subtotal', digits=0, readonly=True)
    cashbox_id = fields.Many2one(
        comodel_name='wizard.update.cashbox', string="Cashbox")
    wiz_id = fields.Many2one(
        comodel_name='wizard.update.bank.statement', string="Wizard")
    currency_id = fields.Many2one(
        comodel_name='res.currency', related='wiz_id.currency_id')


class WizardUpdateCashbox(models.TransientModel):
    _name = 'wizard.update.cashbox'
    _description = 'POS Update Bank Statement Balance Wizard'

    cashbox_lines_ids = fields.One2many(
        comodel_name='wizard.update.cashbox.line',
        inverse_name='cashbox_id', string='Cashbox Lines')
    total = fields.Float(
        compute='_total', string='Total', digits=0, readonly=True)

    @api.multi
    @api.depends('cashbox_lines_ids.subtotal')
    def _total(self):
        _total = 0.0
        for lines in self.cashbox_lines_ids:
            _total += lines.subtotal
        self.total = _total


class AccountCashboxLine(models.Model):
    _inherit = 'account.cashbox.line'

    _BALANCE_MOMENT_SELECTION = [
        ('bydefault', 'Default'),
        ('starting', 'Starting balance'),
        ('ending', 'Ending balance'),
    ]

    balance_moment = fields.Selection(
        selection=_BALANCE_MOMENT_SELECTION, string='Balance moment',
        default='bydefault')
    number = fields.Integer(default=1)


class AccountBankStmtCashWizard(models.Model):
    _inherit = 'account.bank.statement.cashbox'

    name = fields.Char(string="Name")
    is_pattern = fields.Boolean(
        string="Is a selectable pattern", default=False,
    )
