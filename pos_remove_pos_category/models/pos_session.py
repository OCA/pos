# Copyright (C) 2015-TODAY Akretion (<http://www.akretion.com>).
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def load_data(self, models_to_load, only_data=False):
        res = super().load_data(models_to_load, only_data=only_data)
        res["pos.category"] = res.pop("product.category")
        return res

    def _load_pos_data_models(self, config_id):
        res = super()._load_pos_data_models(config_id)
        res.append("product.category")
        return res

    def _load_pos_data_relations(self, model, response):
        super()._load_pos_data_relations(model, response)
        if model == "product.category":
            response[model]["relations"]["parent_id"]["relation"] = "pos.category"
            response[model]["relations"]["child_ids"]["relation"] = "pos.category"
        if model == "product.product":
            response[model]["relations"]["pos_categ_ids"]["relation"] = "pos.category"
        return
