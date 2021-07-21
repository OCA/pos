# Copyright 2020 Akretion (http://www.akretion.com).
# @author Raphaël Reverdy <raphael.reverdy@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models


class IrActionsTellPos(models.Model):
    _name = "ir.actions.tell_pos"
    _description = "Action Window Close"
    _inherit = "ir.actions.actions"

    def _get_readable_fields(self):
        return super()._get_readable_fields() | {"params"}
