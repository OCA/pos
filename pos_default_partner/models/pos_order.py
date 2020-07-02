# copyright 2020 Akretion David BEAL
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.model
    def create(self, vals):
        session = self.env["pos.session"].browse(vals.get("session_id"))
        if session.config_id.default_partner_id and not vals.get("partner_id"):
            vals["partner_id"] = session.config_id.default_partner_id.id
        return super().create(vals)
