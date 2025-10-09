# Copyright (C) 2015 Mathieu VATEL <mathieu@julius.fr>
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: Mathieu VATEL <mathieu@julius.fr>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class PosPaymentMethod(models.Model):
    _inherit = "pos.payment.method"

    is_automatic_validation = fields.Boolean(
        help="If enabled, POS orders paid with this method will be "
        "validated automatically."
    )

    @api.model
    def _load_pos_data_fields(self, config_id):
        result = super()._load_pos_data_fields(config_id)
        return result + ["is_automatic_validation"]
