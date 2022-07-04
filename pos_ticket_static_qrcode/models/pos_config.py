# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Pierre Verkest <pierreverkest84@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
import base64
from odoo import _, api, fields, models
import qrcode
from qrcode.image import pil
from qrcode.constants import ERROR_CORRECT_M
import io


class PosConfig(models.Model):
    _inherit = "pos.config"

    pos_ticket_static_qrcode_value = fields.Char(
        string="QRCode Value",
        help=(
            "QRCode value use to generate QRCOde, "
            "the value return when user scan that QRCode."
        ),
    )
    pos_ticket_static_qrcode_message = fields.Char(
        string="QRCode Message", help=("Message to display under QRCode.")
    )
    pos_ticket_static_qrcode = fields.Binary(
        string="QRCode", compute="_compute_qr_code", readonly=True
    )

    @api.depends("pos_ticket_static_qrcode_value")
    def _compute_qr_code(self):
        """Mainly inspired from report_qr

        I'm not using the report qrcode engine because that qrcode
        is loaded at the begining of the POS session.
        """
        for config in self:
            if config.pos_ticket_static_qrcode_value:
                try:
                    qr = qrcode.QRCode(
                        box_size=3,
                        border=5,
                        image_factory=pil.PilImage,
                        error_correction=ERROR_CORRECT_M,
                    )
                    qr.add_data(config.pos_ticket_static_qrcode_value)
                    qr.make()
                    img = qr.make_image(fill_color="white", back_color="black")
                    png = io.BytesIO()
                    img.save(png)
                    png.seek(0)
                except Exception as ex:
                    raise ValueError(
                        _("Cannot convert %(qrcode_value)s into QR Code: %(error)s")
                        % dict(
                            qrcode_value=config.pos_ticket_static_qrcode_value, error=ex
                        )
                    )
                config.pos_ticket_static_qrcode = base64.b64encode(png.read())
            else:
                config.pos_ticket_static_qrcode = False
