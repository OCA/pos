# Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models


class PosOrder(models.Model):
    _inherit = 'pos.order'

    def _payment_fields(self, ui_paymentline):
        res = super()._payment_fields(ui_paymentline)
        res["statement_note"] = ui_paymentline.get("statement_note", False)
        return res

    def _prepare_bank_statement_line_payment_values(self, data):
        res = super()._prepare_bank_statement_line_payment_values(data)
        res["note"] = data.get("statement_note", False)
        return res
