# Copyright 2023 FactorLibre - Juan Carlos Bonilla
from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    display_default_code = fields.Boolean(default=False)

    def get_limited_products_loading(self, fields):
        if self.display_default_code:
            self = self.with_context(display_default_code=True)
        res = super().get_limited_products_loading(fields)
        return res
