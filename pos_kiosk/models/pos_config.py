from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    is_kiosk_mode = fields.Boolean(
        string="Kiosk Mode",
        help="If checked, the POS will be opened in kiosk mode.",
    )

    banner_image = fields.Binary(
        string="Banner Image",
        help="This field holds the image used as banner on the POS screen Kiosk Mode.",
    )

    top_banner_image = fields.Binary(
        string="Top Banner Image",
        help="This field holds the image used as top banner on the POS screen Kiosk Mode.",
    )

    logo_image = fields.Binary(
        string="Logo Image",
        help="This field holds the image used as logo on the POS header in Kiosk Mode.",
    )

    def _get_pos_base_url(self):
        if self.is_kiosk_mode:
            return "/pos_kiosk/web" if self._force_http() else "/pos_kiosk/ui"
        return super(PosConfig, self)._get_pos_base_url()
