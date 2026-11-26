##############################################################################
#
#    Copyright since 2009 Trobz (<https://trobz.com/>).
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

from odoo import api, fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    credit_amount = fields.Float(
        string="Available Credit",
    )
    credit_line_ids = fields.Many2many(
        comodel_name="pos.payment",
        string="Credit History",
        compute="_compute_credit_line",
        compute_sudo=True,
    )

    @api.depends("credit_amount")
    def _compute_credit_line(self):
        """
        Compute credit transaction history
        """
        for partner in self:
            # Get all credit payments for this partner
            credit_payments = self.env["pos.payment"].search(
                [
                    ("partner_id", "=", partner.id),
                    ("payment_method_id.use_payment_terminal", "=", "credit"),
                ],
                order="payment_date desc",
            )
            partner.credit_line_ids = credit_payments

    @api.model
    def _load_pos_data_fields(self, config_id):
        """
        Load credit_amount field in POS
        """
        params = super()._load_pos_data_fields(config_id)
        params += ["credit_amount"]
        return params
