# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):

    _inherit = "res.config.settings"

    warning_product_availability = fields.Boolean(string="Display Warning")

    def get_values(self):
        res = super(ResConfigSettings, self).get_values()
        param_obj = self.env["ir.config_parameter"].sudo()
        warning_product_availability = param_obj.get_param(
            "warning_product_availability", False
        )
        res.update(warning_product_availability=warning_product_availability)
        return res

    def set_values(self):
        res = super(ResConfigSettings, self).set_values()
        param_obj = self.env["ir.config_parameter"].sudo()
        param_obj.set_param(
            "warning_product_availability", self.warning_product_availability
        )
        return res
