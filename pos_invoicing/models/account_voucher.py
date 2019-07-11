# coding: utf-8
# Copyright (C) 2013 - Today: GRAP (http://www.grap.coop)
# @author: Julien WESTE
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import api, models


class AccountVoucher(models.Model):
    _inherit = 'account.voucher'

    # Override section
    @api.multi
    def recompute_voucher_lines(
            self, partner_id, journal_id, price, currency_id, ttype, date):

        move_line_obj = self.env['account.move.line']

        res = super(AccountVoucher, self).recompute_voucher_lines(
            partner_id, journal_id, price, currency_id, ttype, date)

        for voucher_type in ['line_dr_ids', 'line_cr_ids']:
            for voucher_line in res['value'][voucher_type]:
                move_line = move_line_obj.browse(voucher_line['move_line_id'])
                if move_line.invoice.pos_pending_payment:
                    res['value'][voucher_type].remove(voucher_line)
        return res
