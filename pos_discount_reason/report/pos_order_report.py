# Copyright 2022 KMEE
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import fields, models


class PosOrderReport(models.Model):
    _inherit = "report.pos.order"

    discount_reason_id = fields.Many2one(
        string="Discount Reason",
        comodel_name="pos.discount.reason",
        readonly=True,
    )

    def _select(self):
        return (
            super(PosOrderReport, self)._select()
            + """,l.discount_reason_id AS discount_reason_id"""
        )

    def _group_by(self):
        return super(PosOrderReport, self)._group_by() + ",l.discount_reason_id"
