# Copyright (C) 2024 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models
from odoo.tools import formatLang


class PosOrder(models.Model):
    _inherit = "pos.order"

    payment_description = fields.Char(
        string="Payments Description",
        compute="_compute_payment_description",
        store=True,
    )

    @api.depends("payment_ids.amount")
    def _compute_payment_description(self):
        for order in self:
            details = []
            payment_dict = {}
            for payment in order.payment_ids:
                key = (payment.payment_method_id, payment.currency_id)
                if key not in payment_dict:
                    payment_dict[key] = payment.amount
                else:
                    payment_dict[key] += payment.amount

            for (payment_method, currency), amount in payment_dict.items():
                details.append(
                    "%s: %s"
                    % (
                        payment_method.name,
                        formatLang(self.env, amount, currency_obj=currency),
                    )
                )

            order.payment_description = " - ".join(sorted(details))
