# Copyright 2025 Binhex <https://www.binhex.cloud>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).


from odoo import models


class ResPartnerIdcategory(models.Model):
    _inherit = "res.partner.id_category"

    def _load_pos_data(self, data):
        fields = ["id", "code", "name"]
        return {
            "data": self.search_read([], fields, load=False),
            "fields": fields,
        }
