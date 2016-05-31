import time
from datetime import datetime

from openerp import fields, models, api
from openerp import tools
from openerp.tools import float_is_zero
from openerp.tools.translate import _


class pos_order(models.Model):
    _inherit = "pos.order"

    @api.cr_uid_ids_context
    def _process_order(self, cr, uid, order, context=None):
        session = self.pool.get('pos.session').browse(cr, uid, order['pos_session_id'], context=context)

        if session.state == 'closing_control' or session.state == 'closed':
            session_id = self._get_valid_session(cr, uid, order, context=context)
            session = self.pool.get('pos.session').browse(cr, uid, session_id, context=context)
            order['pos_session_id'] = session_id

        result = []
        payment_terms = self.pool.get('account.payment.term')
        result = payment_terms.compute(
            cr, uid, int(order["payment_terms_id"]), order["amount_total"],
            context=context
        )
        order_id = self.create(cr, uid, self._order_fields(cr, uid, order, context=context),context)
        journal_ids = set()
        for payments in order['statement_ids']:
            for parcel in result:
                payments[2]["name"] = parcel[0]
                payments[2]["amount"] = parcel[1]

                payment_id = self.add_payment(cr, uid, order_id, self._payment_fields(cr, uid, payments[2], context=context), context=context)

        if session.sequence_number <= order['sequence_number']:
            session.write({'sequence_number': order['sequence_number'] + 1})
            session.refresh()

        if not float_is_zero(order['amount_return'], self.pool.get('decimal.precision').precision_get(cr, uid, 'Account')):
            cash_journal = session.cash_journal_id.id
            if not cash_journal:
                # Select for change one of the cash journals used in this payment
                cash_journal_ids = self.pool['account.journal'].search(cr, uid, [
                    ('type', '=', 'cash'),
                    ('id', 'in', list(journal_ids)),
                ], limit=1, context=context)
                if not cash_journal_ids:
                    # If none, select for change one of the cash journals of the POS
                    # This is used for example when a customer pays by credit card
                    # an amount higher than total amount of the order and gets cash back
                    cash_journal_ids = [statement.journal_id.id for statement in session.statement_ids
                                        if statement.journal_id.type == 'cash']
                    if not cash_journal_ids:
                        teste = ""
                        # raise osv.except_osv( _('error!'),
                        #     _("No cash statement found for this session. Unable to record returned cash."))
                cash_journal = cash_journal_ids[0]
            self.add_payment(cr, uid, order_id, {
                'amount': -order['amount_return'],
                'payment_date': time.strftime('%Y-%m-%d %H:%M:%S'),
                'payment_name': _('return'),
                'journal': cash_journal,
            }, context=context)
        return order_id

    def add_payment(self, cr, uid, order_id, data, context=None):
        """Create a new payment for the order"""
        context = dict(context or {})
        statement_line_obj = self.pool.get('account.bank.statement.line')
        property_obj = self.pool.get('ir.property')
        order = self.browse(cr, uid, order_id, context=context)
        date = data.get('payment_date', time.strftime('%Y-%m-%d'))
        if len(date) > 10:
            timestamp = datetime.strptime(date, tools.DEFAULT_SERVER_DATETIME_FORMAT)
            ts = fields.datetime.context_timestamp(cr, uid, timestamp, context)
            date = ts.strftime(tools.DEFAULT_SERVER_DATE_FORMAT)
        args = {
            'amount': data['amount'],
            'date': date,
            'name': order.name + ': ' + (data.get('payment_name', '') or ''),
            'partner_id': order.partner_id and self.pool.get("res.partner")._find_accounting_partner(order.partner_id).id or False,
        }

        journal_id = data.get('journal', False)
        statement_id = data.get('statement_id', False)
        assert journal_id or statement_id, "No statement_id or journal_id passed to the method!"

        journal = self.pool['account.journal'].browse(cr, uid, journal_id, context=context)
        # use the company of the journal and not of the current user
        company_cxt = dict(context, force_company=journal.company_id.id)
        account_def = property_obj.get(cr, uid, 'property_account_receivable', 'res.partner', context=company_cxt)
        args['account_id'] = (order.partner_id and order.partner_id.property_account_receivable \
                             and order.partner_id.property_account_receivable.id) or (account_def and account_def.id) or False

        if not args['account_id']:
            if not args['partner_id']:
                msg = _('There is no receivable account defined to make payment.')
            else:
                msg = _('There is no receivable account defined to make payment for the partner: "%s" (id:%d).') % (order.partner_id.name, order.partner_id.id,)
            raise osv.except_osv(_('Configuration Error!'), msg)

        context.pop('pos_session_id', False)

        for statement in order.session_id.statement_ids:
            if statement.id == statement_id:
                journal_id = statement.journal_id.id
                break
            elif statement.journal_id.id == journal_id:
                statement_id = statement.id
                break

        if not statement_id:
            raise osv.except_osv(_('Error!'), _('You have to open at least one cashbox.'))

        args.update({
            'statement_id': statement_id,
            'pos_statement_id': order_id,
            'journal_id': journal_id,
            'ref': order.session_id.name,
        })

        return statement_line_obj.create(cr, uid, args, context=context)

    # def _create_account_move_line(self, cr, uid, ids, session=None, move_id=None, context=None):
    #     # Tricky, via the workflow, we only have one id in the ids variable
    #     """Create a account move line of order grouped by products or not."""
    #     account_move_obj = self.pool.get('account.move')
    #     account_period_obj = self.pool.get('account.period')
    #     account_tax_obj = self.pool.get('account.tax')
    #     property_obj = self.pool.get('ir.property')
    #     cur_obj = self.pool.get('res.currency')
    #
    #     #session_ids = set(order.session_id for order in self.browse(cr, uid, ids, context=context))
    #
    #     if session and not all(session.id == order.session_id.id for order in self.browse(cr, uid, ids, context=context)):
    #         raise osv.except_osv(_('Error!'), _('Selected orders do not have the same session!'))
    #
    #     grouped_data = {}
    #     have_to_group_by = session and session.config_id.group_by or False
    #
    #     def compute_tax(amount, tax, line):
    #         if amount > 0:
    #             tax_code_id = tax['base_code_id']
    #             tax_amount = line.price_subtotal * tax['base_sign']
    #         else:
    #             tax_code_id = tax['ref_base_code_id']
    #             tax_amount = abs(line.price_subtotal) * tax['ref_base_sign']
    #
    #         return (tax_code_id, tax_amount,)
    #
    #     for order in self.browse(cr, uid, ids, context=context):
    #         if order.account_move:
    #             continue
    #         if order.state != 'paid':
    #             continue
    #
    #         current_company = order.sale_journal.company_id
    #
    #         group_tax = {}
    #         account_def = property_obj.get(cr, uid, 'property_account_receivable', 'res.partner', context=context)
    #
    #         order_account = order.partner_id and \
    #                         order.partner_id.property_account_receivable and \
    #                         order.partner_id.property_account_receivable.id or \
    #                         account_def and account_def.id
    #
    #         if move_id is None:
    #             # Create an entry for the sale
    #             move_id = self._create_account_move(cr, uid, order.session_id.start_at, order.name, order.sale_journal.id, order.company_id.id, context=context)
    #
    #         move = account_move_obj.browse(cr, uid, move_id, context=context)
    #
    #         def insert_data(data_type, values):
    #             # if have_to_group_by:
    #
    #             sale_journal_id = order.sale_journal.id
    #
    #             # 'quantity': line.qty,
    #             # 'product_id': line.product_id.id,
    #             values.update({
    #                 'date': order.date_order[:10],
    #                 'date_maturity': order.date_order[:10],
    #                 'ref': order.name,
    #                 'partner_id': order.partner_id and self.pool.get("res.partner")._find_accounting_partner(order.partner_id).id or False,
    #                 'journal_id' : sale_journal_id,
    #                 'period_id': move.period_id.id,
    #                 'move_id' : move_id,
    #                 'company_id': current_company.id,
    #             })
    #
    #             if data_type == 'product':
    #                 key = ('product', values['partner_id'], values['product_id'], values['analytic_account_id'], values['debit'] > 0)
    #             elif data_type == 'tax':
    #                 key = ('tax', values['partner_id'], values['tax_code_id'], values['debit'] > 0)
    #             elif data_type == 'counter_part':
    #                 key = ('counter_part', values['partner_id'], values['account_id'], values['debit'] > 0)
    #             else:
    #                 return
    #
    #             grouped_data.setdefault(key, [])
    #
    #             # if not have_to_group_by or (not grouped_data[key]):
    #             #     grouped_data[key].append(values)
    #             # else:
    #             #     pass
    #
    #             if have_to_group_by:
    #                 if not grouped_data[key]:
    #                     grouped_data[key].append(values)
    #                 else:
    #                     for line in grouped_data[key]:
    #                         if line.get('tax_code_id') == values.get('tax_code_id'):
    #                             current_value = line
    #                             current_value['date_maturity'] = values['date_maturity']
    #                             current_value['quantity'] = current_value.get('quantity', 0.0) +  values.get('quantity', 0.0)
    #                             current_value['credit'] = current_value.get('credit', 0.0) + values.get('credit', 0.0)
    #                             current_value['debit'] = current_value.get('debit', 0.0) + values.get('debit', 0.0)
    #                             current_value['tax_amount'] = current_value.get('tax_amount', 0.0) + values.get('tax_amount', 0.0)
    #                             break
    #                     else:
    #                         grouped_data[key].append(values)
    #             else:
    #                 grouped_data[key].append(values)
    #
    #         #because of the weird way the pos order is written, we need to make sure there is at least one line,
    #         #because just after the 'for' loop there are references to 'line' and 'income_account' variables (that
    #         #are set inside the for loop)
    #         #TOFIX: a deep refactoring of this method (and class!) is needed in order to get rid of this stupid hack
    #         assert order.lines, _('The POS order must have lines when calling this method')
    #         # Create an move for each order line
    #
    #         cur = order.pricelist_id.currency_id
    #         round_per_line = True
    #         if order.company_id.tax_calculation_rounding_method == 'round_globally':
    #             round_per_line = False
    #         for line in order.lines:
    #             tax_amount = 0
    #             taxes = []
    #             for t in line.product_id.taxes_id:
    #                 if t.company_id.id == current_company.id:
    #                     taxes.append(t)
    #             computed_taxes = account_tax_obj.compute_all(cr, uid, taxes, line.price_unit * (100.0-line.discount) / 100.0, line.qty)['taxes']
    #
    #             for tax in computed_taxes:
    #                 tax_amount += cur_obj.round(cr, uid, cur, tax['amount']) if round_per_line else tax['amount']
    #                 if tax_amount < 0:
    #                     group_key = (tax['ref_tax_code_id'], tax['base_code_id'], tax['account_collected_id'], tax['id'])
    #                 else:
    #                     group_key = (tax['tax_code_id'], tax['base_code_id'], tax['account_collected_id'], tax['id'])
    #
    #                 group_tax.setdefault(group_key, 0)
    #                 group_tax[group_key] += cur_obj.round(cr, uid, cur, tax['amount']) if round_per_line else tax['amount']
    #
    #             amount = line.price_subtotal
    #
    #             # Search for the income account
    #             if  line.product_id.property_account_income.id:
    #                 income_account = line.product_id.property_account_income.id
    #             elif line.product_id.categ_id.property_account_income_categ.id:
    #                 income_account = line.product_id.categ_id.property_account_income_categ.id
    #             else:
    #                 raise osv.except_osv(_('Error!'), _('Please define income '\
    #                     'account for this product: "%s" (id:%d).') \
    #                     % (line.product_id.name, line.product_id.id, ))
    #
    #             # Empty the tax list as long as there is no tax code:
    #             tax_code_id = False
    #             tax_amount = 0
    #             while computed_taxes:
    #                 tax = computed_taxes.pop(0)
    #                 tax_code_id, tax_amount = compute_tax(amount, tax, line)
    #
    #                 # If there is one we stop
    #                 if tax_code_id:
    #                     break
    #
    #             # Create a move for the line
    #             insert_data('product', {
    #                 'name': line.product_id.name,
    #                 'quantity': line.qty,
    #                 'product_id': line.product_id.id,
    #                 'account_id': income_account,
    #                 'analytic_account_id': self._prepare_analytic_account(cr, uid, line, context=context),
    #                 'credit': ((amount>0) and amount) or 0.0,
    #                 'debit': ((amount<0) and -amount) or 0.0,
    #                 'tax_code_id': tax_code_id,
    #                 'tax_amount': tax_amount,
    #                 'partner_id': order.partner_id and self.pool.get("res.partner")._find_accounting_partner(order.partner_id).id or False
    #             })
    #
    #             # For each remaining tax with a code, whe create a move line
    #             for tax in computed_taxes:
    #                 tax_code_id, tax_amount = compute_tax(amount, tax, line)
    #                 if not tax_code_id:
    #                     continue
    #
    #                 insert_data('tax', {
    #                     'name': _('Tax'),
    #                     'product_id':line.product_id.id,
    #                     'quantity': line.qty,
    #                     'account_id': income_account,
    #                     'credit': 0.0,
    #                     'debit': 0.0,
    #                     'tax_code_id': tax_code_id,
    #                     'tax_amount': tax_amount,
    #                     'partner_id': order.partner_id and self.pool.get("res.partner")._find_accounting_partner(order.partner_id).id or False
    #                 })
    #
    #         # Create a move for each tax group
    #         (tax_code_pos, base_code_pos, account_pos, tax_id)= (0, 1, 2, 3)
    #
    #         for key, tax_amount in group_tax.items():
    #             tax = self.pool.get('account.tax').browse(cr, uid, key[tax_id], context=context)
    #             insert_data('tax', {
    #                 'name': _('Tax') + ' ' + tax.name,
    #                 'quantity': line.qty,
    #                 'product_id': line.product_id.id,
    #                 'account_id': key[account_pos] or income_account,
    #                 'credit': ((tax_amount>0) and tax_amount) or 0.0,
    #                 'debit': ((tax_amount<0) and -tax_amount) or 0.0,
    #                 'tax_code_id': key[tax_code_pos],
    #                 'tax_amount': abs(tax_amount) * tax.tax_sign if tax_amount>=0 else abs(tax_amount) * tax.ref_tax_sign,
    #                 'partner_id': order.partner_id and self.pool.get("res.partner")._find_accounting_partner(order.partner_id).id or False
    #             })
    #
    #         # counterpart
    #         insert_data('counter_part', {
    #             'name': _("Trade Receivables"), #order.name,
    #             'account_id': order_account,
    #             'credit': ((order.amount_total < 0) and -order.amount_total) or 0.0,
    #             'debit': ((order.amount_total > 0) and order.amount_total) or 0.0,
    #             'partner_id': order.partner_id and self.pool.get("res.partner")._find_accounting_partner(order.partner_id).id or False
    #         })
    #
    #         order.write({'state':'done', 'account_move': move_id})
    #
    #     all_lines = []
    #     for group_key, group_data in grouped_data.iteritems():
    #         for value in group_data:
    #             all_lines.append((0, 0, value),)
    #     if move_id: #In case no order was changed
    #         self.pool.get("account.move").write(cr, uid, [move_id], {'line_id':all_lines}, context=context)
    #
    #     return True


class account_move_line(models.Model):
    _inherit = "account.move.line"

    @api.cr_uid_ids_context
    def create(self, cr, uid, vals, context=None, check=True):
        if 'POS' in vals['ref']:
            result = super(account_move_line, self).create(cr, uid, vals, context=context, check=True)
            account_move_line_obj = self.browse(cr, uid, result, context=context)
            account_move_line_obj.write({'date_maturity':vals['date']})
        else:
            super(account_move_line, self).create(cr, uid, vals, context=context, check=True)
