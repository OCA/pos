from odoo import models


class ResPartner(models.Model):
    _inherit = "res.partner"

    def _load_pos_data_fields(self, config_id):
        """Override to add sale warning fields to the list of fields loaded by POS"""
        fields = super()._load_pos_data_fields(config_id)
        if self.env.user.has_group("sale.group_warning_sale"):
            fields.extend(["sale_warn", "sale_warn_msg"])
        return fields
