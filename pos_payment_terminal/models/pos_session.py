from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_pos_payment_method(self):
        params = super()._loader_params_pos_payment_method()
        params["search_params"]["fields"].extend(
            ["oca_payment_terminal_mode", "oca_payment_terminal_id"]
        )

        return params
