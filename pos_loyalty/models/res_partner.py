# Copyright 2004-2010 OpenERP SA
# Copyright 2017 RGB Consulting S.L. (https://www.rgbconsulting.com)
# Copyright 2022 Lorenzo Battistini @ TAKOBI
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    loyalty_points = fields.Float(
        string="Loyalty Points",
        help="The loyalty points the user won as " "part of a Loyalty Program",
    )
    pos_order_ids = fields.One2many(
        "pos.order", "partner_id", string="POS orders", readonly=True
    )

    @api.depends("pos_order_ids.loyalty_points")
    def _compute_loyalty_points(self):
        for p in self:
            p.loyalty_points = sum(p.pos_order_ids.mapped("loyalty_points"))
