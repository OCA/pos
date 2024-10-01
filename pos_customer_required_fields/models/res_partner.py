# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Pierre Verkest <pierreverkest84@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import _, api, models
from odoo.exceptions import ValidationError


class ResPartner(models.Model):
    _inherit = "res.partner"

    @api.model
    def create_from_ui(self, partner_data):
        """Ensure all fields required pos session fields to be set."""
        pos_config_id = partner_data.pop("pos_config_id")
        partner_id = super().create_from_ui(partner_data)
        partner = self.browse(partner_id)
        pos_config = self.env["pos.config"].browse(int(pos_config_id))
        missing_fields = []
        for field in pos_config.res_partner_required_fields_ids:
            if not getattr(partner, field.name):
                missing_fields.append(field.field_description)
        if missing_fields:
            raise ValidationError(
                _("Following required field(s) is/are not set: %s.")
                % ", ".join(missing_fields)
            )
        return partner_id
