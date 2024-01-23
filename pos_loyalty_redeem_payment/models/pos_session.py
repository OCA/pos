from odoo import models


class PosPaymentMethod(models.Model):
    _inherit = "pos.session"

    def _loader_params_pos_payment_method(self):
        result = super()._loader_params_pos_payment_method()
        result["search_params"]["fields"].extend(["used_for_loyalty_program"])
        return result
