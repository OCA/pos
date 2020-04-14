# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author Quentin DUPONT (quentin.dupont@grap.coop)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    # Columns Section
    autosolve_pos_move_reason = fields.Many2one(
        string="Autosolve pos move reason",
        description="Product used to autosolve control difference",
        comodel_name="pos.move.reason",
        domain="['|', \
        ('is_income_reason', '=', True), ('is_expense_reason', '=', True)]",
        default="",
    )

    autosolve_limit = fields.Float(
        string="Autosolve limit",
        description="Limit for autosolving bank statement", default=20
    )

    @api.multi
    def open_new_session(self, openui):
        self.ensure_one()
        # Check if some opening / opened session exists
        session_obj = self.env['pos.session']
        sessions = session_obj.search([
            ('user_id', '=', self.env.uid),
            ('config_id', '=', self.id),
            ('state', 'in', ['opened', 'opening_control']),
        ], limit=1)
        if sessions:
            # An opening / opened session exists
            session = sessions[0]
        else:
            # Create a session
            session = session_obj.create({
                'user_id': self.env.uid,
                'config_id': self.id,
            })

        if session.state == 'opening_control' or openui is False:
            return self._open_session(session.id)
        return self.open_ui()
