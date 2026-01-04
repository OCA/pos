# Copyright 2025 Tecnativa - Pedro M. Baeza
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import models
from odoo.tools import config


class PosSession(models.Model):
    _inherit = "pos.session"

    def _create_picking_at_end_of_session(self):
        # Nullify the creation of the pickings at this level
        # We cannot use self.env.context.get("test_pos_sale_picking_keep") because
        # the tours that run in the tests do not allow that context to be maintained.
        # Therefore, we use self.config_id.name.
        if (
            config["test_enable"]
            and self.config_id.name != "test_pos_sale_picking_keep"
        ):
            # For not breaking tests of other modules
            return super()._create_picking_at_end_of_session()
        return True
