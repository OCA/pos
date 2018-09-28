# Copyright 2018 Lambda IS DOOEL <https://www.lambda-is.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, models


class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'

    @api.model
    def _order_line_fields(self, line, session_id=None):
        line = super(PosOrderLine, self)._order_line_fields(
            line, session_id=session_id)
        if line and 'reward_id' in line[2]:
            # Delete the key since field doesn't exist
            # and raises a warning in the logs.
            # TODO: add field and remove this if data will be
            # used on server, example in report / widget.
            del line[2]['reward_id']
        return line
