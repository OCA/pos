# Copyright (C) 2015 Mathieu VATEL <mathieu@julius.fr>
# Copyright (C) 2016-Today: La Louve <http://www.lalouve.net/>
# Copyright (C) 2019 Druidoo <https://www.druidoo.io>

from odoo import api, fields, models


class PosPaymentMethod(models.Model):
    _inherit = "pos.payment.method"

    iface_automatic_cashdrawer = fields.Boolean(
        "Automatic cashdrawer",
    )

    @api.model
    def _load_pos_data_fields(self, config_id):
        result = super()._load_pos_data_fields(config_id)
        result.append("iface_automatic_cashdrawer")
        return result
