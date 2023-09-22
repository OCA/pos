# Copyright 2023 Ooops404
# License AGPL-3 - See https://www.gnu.org/licenses/agpl-3.0.html

from odoo import api, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    @api.model
    def get_required_customer_fields(self):
        res = []
        # only these fields present in Edit Customer Details form of the POS
        pos_fields = [
            "street",
            "city",
            "zip",
            "state_id",
            "country_id",
            "lang",
            "email",
            "phone",
            "barcode",
            "vat",
        ]
        restrictions = self.env["custom.field.restriction"].search(
            [("model_name", "=", self._name), ("field_name", "in", pos_fields)]
        )
        if not restrictions:
            return res
        for r in restrictions:
            if r.required_field_id:
                if not r.group_ids:
                    res.append(r.field_name)
                elif r.group_ids & self.env.user.groups_id:
                    res.append(r.field_name)
        return res
