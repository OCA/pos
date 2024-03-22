# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import logging

from odoo import api, fields, models

_logger = logging.getLogger(__name__)


class ResPartner(models.Model):
    _inherit = "res.partner"

    qr_code_url = fields.Char(compute="_compute_qr_code_url")

    def _compute_qr_code_url(self):
        """Compute QR Code URL for map provider"""
        self.update({"qr_code_url": ""})

    @api.model
    def create_from_ui(self, partner):
        try:
            lat = float(partner.get("partner_latitude"))
        except (TypeError, ValueError):
            lat = False
        try:
            lng = float(partner.get("partner_longitude"))
        except (TypeError, ValueError):
            lng = False
        partner.update(partner_latitude=lat, partner_longitude=lng)
        return super().create_from_ui(partner)
