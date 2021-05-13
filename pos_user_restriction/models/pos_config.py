from odoo import api, models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'

    assigned_user_ids = fields.Many2many(
        "res.users", string="Assigned users",
        help="Restrict some users to only access their assigned points of sale. "
             "In order to apply the restriction, the user needs the "
             "'User: Assigned POS Only' group")

    def write(self, vals):
            result = super(PosConfig, self).write(vals)
            if vals.get('employee_ids'):
                self.write({'group_pos_user_id': self.env.ref('pos_user_restriction.group_assigned_points_of_sale_user').id})
            return result
