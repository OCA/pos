# Copyright 2016 La Louve - Sylvain LE GAL <https://twitter.com/legalsylvain>
# Copyright 2019 Druidoo - (https://www.druidoo.io)
# Copyright 2022 NuoBiT - Eric Antones <eantones@nuobit.com>
# Copyright 2022 NuoBiT - Kilian Niubo <kniubo@nuobit.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)


from odoo import _, models
from odoo.exceptions import UserError


class PosMakePayment(models.TransientModel):
    _inherit = "pos.make.payment"

    def check(self):
        # Load current order
        order_obj = self.env["pos.order"]
        order = order_obj.browse(self.env.context.get("active_id", False))

        # Check if control is required
        if not order.partner_id and order.session_id.config_id.require_customer != "no":
            raise UserError(
                _(
                    "An anonymous order cannot be confirmed.\n"
                    "Please select a customer for this order."
                )
            )

        return super(PosMakePayment, self).check()
