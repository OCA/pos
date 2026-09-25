# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.fr/>)
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: La Louve
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html

from odoo import api, fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    pos_email_receipt = fields.Selection(
        [
            ("email_pos_receipt", "E-receipt Only"),
            ("no_email_pos_receipt", "No E-receipt"),
        ],
        string="POS Email Receipt Preference",
        help="- E-receipt: The user will only receive e-receipt \n"
        "- No E-receipt: The user will not receive e-receipt",
    )

    @api.model
    def _load_pos_data_fields(self, config_id):
        fields = super()._load_pos_data_fields(config_id)
        fields.append("pos_email_receipt")
        return fields
