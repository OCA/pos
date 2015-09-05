# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Change Payment module for Odoo
#    Copyright (C) 2015-Today GRAP (http://www.grap.coop)
#    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

#from openerp.osv import fields
#from openerp.osv.osv import except_osv
from openerp.exceptions import ValidationError
from openerp import models, api, fields
from openerp.tools.translate import _


class PosSwitchJournalWizard(models.TransientModel):
    _name = 'pos.switch.journal.wizard'

    # Default Section
    def _default_statement_line_id(self):
        return self._context.get('active_id')

    # Column Section
    statement_line_id = fields.Many2one(
        comodel_name='account.bank.statement.line', string='Statement',
        required=True, readonly=True, default=_default_statement_line_id)

    old_journal_id = fields.Many2one(
        comodel_name='account.journal', string='Old Journal', required=True,
        readonly=True)

    available_journal_ids = fields.Many2many(
        comodel_name='account.journal',
        compute='_compute_available_journal_ids')

    new_journal_id = fields.Many2one(
        comodel_name='account.journal', string='New Journal',
        domain="[('id', 'in', available_journal_ids)]")

    amount = fields.Float(string='Amount', readonly=True)

    new_statement_id = fields.Many2one()

    # Compute Section
    @api.one
    @api.depends('statement_line_id')
    def _compute_available_journal_ids(self):
        res = []
        for statement in self.statement_line_id.pos_statement_id\
                .session_id.statement_ids:
            res.append(statement.journal_id.id)
        self.available_journal_ids = res


#        selection='_get_new_statement_id', string='New Journal',
#        required=True),

#    @api.model
#    def _get_new_statement_id(self, cr, uid, context=None):
#        absl_obj = self.pool['account.bank.statement.line']
#        abs_obj = self.pool['account.bank.statement']

#        if context.get('active_model', False) != 'account.bank.statement.line':
#            return True
#        absl = absl_obj.browse(
#            cr, uid, context.get('active_id'), context=context)
#        abs_ids = [
#            x.id for x in absl.pos_statement_id.session_id.statement_ids]

#        res = abs_obj.read(
#            cr, uid, abs_ids, ['id', 'journal_id'], context=context)
#        res = [(
#            r['id'], r['journal_id'][1])
#            for r in res if r['id'] != absl.statement_id.id]
#        return res

#    _columns = {

#    }

    # View Section
#    @api.model
#    def default_get(self, fields):
#        statement_line_obj = self.env['account.bank.statement.line']
#        res = super(PosSwitchJournalWizard, self).default_get(fields)
#        statement_line = statement_line_obj.browse(
#            self._context.get('active_id'))
#        self.statement_line_id = statement_line.id
#        res.update({
##            'statement_line_id': statement_line.id,
#            'old_journal_id': statement_line.journal_id.id,
#            'amount': statement_line.amount,
#        })
#        return res

    # Action section
    @api.one
    def button_switch_journal(self):
#        if self.statement_line_id.pos_statement_id:
        self.statement_line_id.pos_statement_id._allow_change_payments()


        # TODO : FIXME when upstream is fixed.
        # We do 2 write, one in the old statement, one in the new, with
        # 'amount' value each time to recompute all the functional fields
        # of the Account Bank Statements
#        self.statement_line_id.with_context(change_pos_payment=True).write({
#            'amount': 0,
#        })

#        self.statement_line_id.with_context(change_pos_payment=True).write({
#            'amount': self.statement_line_id.amount,
#            'statement_id': self.new_statement_id.id,
#        })

#        amount = absl.amount
#        ctx = context.copy()
#        ctx['change_pos_payment'] = True
#        absl_obj.write(cr, uid, [absl.id], {
#            'amount': 0,
#        }, context=ctx)
#        # Change statement of the statement line
#        absl_obj.write(cr, uid, [absl.id], {
#            'amount': amount,
#            'statement_id': int(psjw.new_statement_id),
#        }, context=ctx)

        return {
            'type': 'ir.actions.client',
            'tag': 'reload',
        }
