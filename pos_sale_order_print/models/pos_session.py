# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _pos_ui_models_to_load(self):
        result = super()._pos_ui_models_to_load()
        result.append("ir.actions.report")
        return result

    def _loader_params_ir_actions_report(self):
        return {
            "search_params": {
                "domain": [("model", "=", "sale.order")],
                "fields": ["id", "name"],
            },
        }

    def _get_pos_ui_ir_actions_report(self, params):
        return self.env["ir.actions.report"].search_read(**params["search_params"])
