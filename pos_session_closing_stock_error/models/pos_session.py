from odoo import models, _
from odoo.exceptions import ValidationError


class PosSession(models.Model):
    _inherit = 'pos.session'

    def action_pos_session_close(self):
        for rec in self:
            if (
                rec.picking_count
                and not rec.config_id.allow_session_closing_with_stock_errors
            ):
                raise ValidationError(_(
                    "It's not possible to close the session %s because it has "
                    "%i picking error(s).\nPlease resolve them or enable "
                    "'Allow closing sessions with stock errors' in "
                    "PoS Configuration: %s.") % (
                        rec.name, rec.picking_count, rec.config_id.name))
        return super().action_pos_session_close()
