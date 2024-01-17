# Copyright 2024 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _pos_data_process(self, loaded_data):
        result = super()._pos_data_process(loaded_data)
        loaded_data["pos_order_copy_fields"] = [
            field_name
            for field_name, field in self.env["pos.order"]._fields.items()
            if field.copy and field.store and not field.automatic and not field.compute
        ]
        loaded_data["pos_order_line_copy_fields"] = [
            field_name
            for field_name, field in self.env["pos.order.line"]._fields.items()
            if field.copy and field.store and not field.automatic and not field.compute
        ]
        return result
