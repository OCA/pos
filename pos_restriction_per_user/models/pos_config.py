# Copyright 2026 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    restrict_user_ids = fields.Many2many(
        comodel_name="res.users",
        relation="pos_config_restrict_user_rel",
        string="Allowed users",
        domain=lambda self: [
            ("groups_id", "in", [self.env.ref("point_of_sale.group_pos_user").id])
        ],
    )
