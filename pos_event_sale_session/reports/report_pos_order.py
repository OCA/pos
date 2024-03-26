# Copyright 2021 Moka Tourisme (https://www.mokatourisme.fr).
# @author Iván Todorovich <ivan.todorovich@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosOrderReport(models.Model):
    _inherit = "report.pos.order"

    event_session_id = fields.Many2one(
        comodel_name="event.session",
        string="Event Session",
        readonly=True,
    )

    def _select(self):
        res = super()._select()
        return f"""
            {res},
            l.event_session_id AS event_session_id
        """

    def _group_by(self):
        res = super()._group_by()
        return f"""
            {res},
            l.event_session_id
        """
