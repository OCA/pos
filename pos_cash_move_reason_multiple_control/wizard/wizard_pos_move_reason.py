# Copyright (C) 2021-Today: GTRAP (<http://www.grap.coop/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from odoo import api, fields, models


class WizardPosMoveReason(models.TransientModel):
    _inherit = 'wizard.pos.move.reason'
    _description = 'PoS Move Reasons Wizard'

    current_control_difference = fields.Float(
        string="Current Difference", compute="_compute_control_differences"
    )

    new_control_difference = fields.Float(
        string="New Difference", compute="_compute_control_differences"
    )

    @api.depends(
        "statement_id.balance_end_real",
        "statement_id.balance_start",
        "statement_id.total_entry_encoding",
        "amount",
        "move_type",
    )
    def _compute_control_differences(self):
        for wizard in self:
            statement = wizard.statement_id
            wizard.current_control_difference = (
                + statement.balance_end_real
                - statement.balance_start
                - statement.total_entry_encoding
            )
            if wizard.move_type == "income":
                wizard.new_control_difference =\
                    wizard.current_control_difference - wizard.amount
            elif wizard.move_type == "expense":
                wizard.new_control_difference =\
                    wizard.current_control_difference + wizard.amount
