# Copyright (C) 2023-Today
# @author Emanuel Cino
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _get_attributes_by_ptal_id(self):
        # Inject in context to allow filtering attributes inside the search method
        return super(PosSession, self.with_context(search_from_pos=True))._get_attributes_by_ptal_id()
