from odoo import api, models


class AccountMove(models.Model):
    _inherit = "account.move"

    @api.model_create_multi
    def create(self, vals_list):
        if self.env.context.get("pos_default_partner_id", False):
            default_partner_id = self.env.context["pos_default_partner_id"].id
            for vals in vals_list:
                if not vals.get("partner_id", False):
                    vals["partner_id"] = default_partner_id
        return super().create(vals_list)
