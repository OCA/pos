# copyright 2020 Akretion David BEAL
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.model
    def _complete_values_from_session(self, session, values):
        result = super()._complete_values_from_session(session, values)
        if session.config_id.default_partner_id and not result.get("partner_id"):
            result["partner_id"] = session.config_id.default_partner_id.id
        return result
