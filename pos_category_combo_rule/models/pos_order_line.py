# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosOrderLine(models.Model):

    _inherit = "pos.order.line"

    combo_rule_id = fields.Many2one(comodel_name="combo.rule", string="Combo Rule")

    combo_discount_amount = fields.Float(string="Combo Discount Amount")
