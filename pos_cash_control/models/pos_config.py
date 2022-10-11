# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    default_bill_ids = fields.Many2many("pos.bill", string="Coins/Bills")
    set_maximum_difference = fields.Boolean(
        "Set Maximum Difference",
        help="Set a maximum difference allowed between the expected and"
        + " counted money during the closing of the session.",
    )
