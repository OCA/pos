from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    assigned_user_ids = fields.Many2many(
        "res.users",
        string="Assigned users",
        help="Restrict some users to only access their assigned points of sale."
        "In order to apply the restriction, the user needs the "
        "'User: Assigned POS Only' group",
    )
    group_pos_user_id = fields.Many2one(
        "res.groups",
        compute="_compute_group_pos_user_id",
        string="Point of Sale User Group",
        help="This field is there to pass"
        "the id of the pos user group to the point of sale client.",
        store=True,
    )

    @api.depends("assigned_user_ids")
    def _compute_group_pos_user_id(self):
        for config in self:
            config.group_pos_user_id = self.env.ref(
                "pos_user_restriction.group_assigned_points_of_sale_user",
                "point_of_sale.group_pos_user",
            )
