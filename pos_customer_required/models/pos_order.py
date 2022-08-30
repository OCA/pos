# Copyright 2004 apertoso NV - Jos DE GRAEVE <Jos.DeGraeve@apertoso.be>
# Copyright 2016 La Louve - Sylvain LE GAL <https://twitter.com/legalsylvain>
# Copyright 2019 Druidoo - (https://www.druidoo.io)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)

from odoo import _, api, exceptions, fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    require_customer = fields.Selection(
        related="session_id.config_id.require_customer",
    )

    @api.constrains("partner_id", "session_id")
    def _check_partner(self):
        for rec in self:
            if rec.require_customer != "no" and not rec.partner_id:
                raise exceptions.ValidationError(
                    _("Customer is required for this order and is missing.")
                )
