# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import logging

from odoo import _, api, models

from .address_google_struct import AddressGoogleStruct

_logger = logging.getLogger(__name__)


class GeoProvider(models.AbstractModel):
    _inherit = "base.geocoder"

    @api.model
    def prepare_geo_address_googlemap(self, place_id):
        """
        Prepare Address values by place id
        :param str place_id: Google map place id
        :return dict: address fields values
        """
        google = AddressGoogleStruct(self.env)
        if not google.has_token():
            raise models.UserError(
                _(
                    "API key for GeoCoding (Places) required.\n"
                    "Visit https://developers.google.com/maps/documentation/geocoding/get-api-key "  # noqa
                    "for more information."
                )
            )
        status = google.query_addr({"place_id": place_id})
        if status:
            return google.get_result()
        _logger.warning("Google map place id is not found!")
        return {}
