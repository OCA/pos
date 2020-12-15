# Copyright 2017 Akretion (http://www.akretion.com).
# @author Raphaël Reverdy <raphael.reverdy@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, api


class Partner(models.Model):
    _inherit = "res.partner"

    def select_in_pos_current_order(self):
        """Set point of sale customer to this partner.

        Action called from view with self.id = a res.partner.
        """
        return {
            'type': 'ir.actions.tell_pos',
            'params': {
                'type': 'partner.partner_selected',
                'partner_id': self.id,
                'name': self.name,
            },
        }
