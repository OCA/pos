# Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models


class PosOrder(models.Model):
    _inherit = "pos.order"

    def _payment_fields(self, order, ui_paymentline):
        res = super()._payment_fields(order, ui_paymentline)
        # the pos.payment.name field is named "Label" and is not used for
        # normal payments, so it is used here to store the payment note (the
        # barcode of paper meal vouchers).
        res["name"] = ui_paymentline.get("payment_note", False)
        return res
