# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openerp import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    partner_category_id = fields.Many2one(
        string="Customer tag",
        help="Partner tag allowing to show only customers who belong to it.",
        comodel_name="res.partner.category",
        ondelete="restrict",
        required=False,
    )
