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
            for payment in order.payment_ids.filtered(
                lambda x: x.payment_method_id.journal_id
            ):
                details.append(
                    "%s: %s"
                    % (
                        payment.payment_method_id.journal_id.code,
                        formatLang(
                            self.env, payment.amount, currency_obj=payment.currency_id
                        ),
                    )
                )
            for payment in order.payment_ids.filtered(
                lambda x: not x.payment_method_id.journal_id
            ):
                details.append(
                    "%s: %s"
                    % (
                        payment.payment_method_id.name,
                        formatLang(
                            self.env, payment.amount, currency_obj=payment.currency_id
                        ),
                    )
                )
            order.payment_description = " - ".join(sorted(details))
