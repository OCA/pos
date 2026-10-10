from odoo import api, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    @api.model
    def _is_cashdrawer_displayed(self, res_config):
        """
        Keep QZ Tray cash-drawer setting independent from IoT proxy.
        If not, when entering on the POS settings, the cash-drawer check will
        be changed because is not a pos_iface_print_via_proxy.
        """
        pos_config = res_config.pos_config_id

        if pos_config.is_qztray:
            return pos_config.iface_cashdrawer

        return super()._is_cashdrawer_displayed(res_config)
