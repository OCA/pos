# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosMakePayment(models.TransientModel):
    _inherit = 'pos.make.payment'

    is_credit = fields.Boolean(
        string="Allow to add credit for members",
        related="journal_id.is_credit",
        readonly=True
    )
