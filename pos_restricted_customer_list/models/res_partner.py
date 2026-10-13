# Copyright 2017-2019 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models
from odoo.fields import Domain


class ResPartner(models.Model):
    _inherit = "res.partner"

    available_in_pos = fields.Boolean(
        string="Available for POS",
        default=False,
    )

    @api.model
    def _pos_restricted_partner_domain(self, config):
        domain = Domain("available_in_pos", "=", True)
        if config.pos_partner_category and config.partner_category_id:
            domain = domain.AND(
                [domain, [("category_id", "in", config.partner_category_id.ids)]]
            )
        return domain

    @api.model
    def _load_pos_data_domain(self, data, config):
        domain = super()._load_pos_data_domain(data, config)
        return Domain.AND([domain, self._pos_restricted_partner_domain(config)])

    @api.model
    def get_new_partner(self, config_id, domain, offset):
        """
        Customer search box restriction.
        """
        config = self.env["pos.config"].sudo().browse(config_id)
        domain = Domain.AND([self._pos_restricted_partner_domain(config), list(domain)])
        return super().get_new_partner(config_id, domain, offset)
