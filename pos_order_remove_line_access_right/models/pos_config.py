from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    group_delete_order_line_id = fields.Many2one(
        comodel_name="res.groups",
        compute="_compute_groups",
        string="Point of Sale - Delete Order line",
        help="This field is there to pass the id of the 'PoS - Delete Order line'"
        " Group to the Point of Sale Frontend.",
    )

    def _compute_groups(self):
        super()._compute_groups()
        self.update(
            {
                "group_delete_order_line_id": self.env.ref(
                    "pos_order_remove_line_access_right.group_delete_order_line"
                ).id,
            }
        )
