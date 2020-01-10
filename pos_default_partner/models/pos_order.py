# copyright 2020 Akretion David BEAL
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.model
    def create(self, vals):
        if not vals.get("partner_id"):
            company_id = vals.get("company_id") or self.env.user.company_id.id
            partner = self.env["res.company"].browse(company_id).pos_default_partner_id
            if partner:
                vals["partner_id"] = partner.id
        return super().create(vals)
