# Copyright (C) 2022 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models


class PosOrder(models.Model):
    _inherit = "pos.order"

    def _action_create_invoice_line(self, line=False, invoice_id=False):
        invoice_line = super()._action_create_invoice_line(
            line=line, invoice_id=invoice_id
        )
        if line:
            invoice_line.purchase_price = line.purchase_price
        return invoice_line
