# Copyright 2026 Therp BV <https://therp.nl>.
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    pos_pay_on_account = fields.Boolean(
        string="Allowed in POS",
        help=(
            "If enabled, this partner can be loaded and selected in the POS when the "
            "POS configuration has 'Restrict customers to pay-on-account' enabled."
        ),
        default=False,
    )
