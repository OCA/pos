# Copyright 2017 Akretion (http://www.akretion.com).
# @author Raphaël Reverdy <raphael.reverdy@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models


class Partner(models.Model):
    _inherit = "res.partner"

    def select_in_pos_current_order(self):
        """Set point of sale customer to this partner.

        Action called from view with self.id = a res.partner.
        """

        def _normalizeRelation(relation):
            if not relation:
                return []
            else:
                return [relation.id, relation.display_name]

        return {
            "type": "ir.actions.tell_pos",
            "params": {
                "type": "partner.partner_selected",
                "partner_id": self.id,
                "name": self.name,
                "property_account_position_id": _normalizeRelation(
                    self.property_account_position_id
                ),
                "property_product_pricelist": _normalizeRelation(
                    self.property_product_pricelist
                ),
                "lang": self.lang,
            },
        }
