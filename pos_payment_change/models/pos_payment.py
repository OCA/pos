# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models


class PosPayment(models.Model):
    _inherit = "pos.payment"

    def _check_amount(self):
        if self.env.context.get("skip_pos_payment_invoiced_check_amount"):
            self -= self.filtered(lambda x: x.state == "invoiced")
        return super()._check_amount()
