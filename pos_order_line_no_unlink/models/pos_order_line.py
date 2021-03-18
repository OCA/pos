# Copyright (C) 2021 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, api, models
from odoo.exceptions import UserError


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    @api.multi
    def unlink(self):
        if self.filtered(
            lambda x: x.order_id.state not in ["draft", "cancel"]
        ):
            raise UserError(_(
                "You can only unlink PoS order lines that are related"
                " to orders in new or cancelled state."))
        return super().unlink()
