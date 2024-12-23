# Copyright 2024 Antoni Marroig(APSL-Nagarro)<amarroig@apsl.net>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    def _default_session_sequence_id(self):
        return self.env.ref("point_of_sale.seq_pos_session").id

    session_sequence_id = fields.Many2one(
        "ir.sequence",
        string="Session IDs Sequence",
        help="This sequence is automatically created by Odoo but you can change it "
        "to customize the reference numbers of your sessions.",
        copy=False,
        ondelete="restrict",
        default=_default_session_sequence_id,
    )
