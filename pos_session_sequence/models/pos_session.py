# Copyright 2024 Antoni Marroig(APSL-Nagarro)<amarroig@apsl.net>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def set_opening_control(self, cashbox_value: int, notes: str):
        res = super().set_opening_control(cashbox_value, notes)
        config = self.config_id
        if not self.rescue and config and config.session_sequence_id:
            self.name = config.session_sequence_id._next()
        return res
