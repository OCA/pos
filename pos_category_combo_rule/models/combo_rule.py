# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import collections

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class ComboRule(models.Model):

    _name = "combo.rule"
    _description = "Combo rule to apply discounts on POS"
    _check_company_auto = True

    name = fields.Char(string="Name", required=True)

    combo_rule_item_ids = fields.One2many(
        comodel_name="combo.rule.item",
        inverse_name="rule_id",
        string="Combo Items",
    )

    priority = fields.Selection(
        selection=[
            ("0", "Very Low"),
            ("1", "Low"),
            ("2", "Normal"),
            ("3", "High"),
            ("4", "Very High"),
        ],
        string="Priority",
        default="0",
        help="The priority of the rule when you have multiple rules.",
    )

    company_id = fields.Many2one(
        comodel_name="res.company",
        default=lambda self: self.env.company.id,
        string="Company",
    )

    @api.constrains("combo_rule_item_ids")
    def _check_duplicated_combo_rule_items(self):
        rule_items_map = self.get_combo_rules_items_map().values()
        counter_items = collections.Counter(rule_items_map).items()

        if any([counter > 1 for item, counter in counter_items]):
            raise ValidationError(_("Unable to create two rules with the same items."))

    def get_combo_rules_items_map(self):
        return {
            rec.id: rec.combo_rule_item_ids.mapped("category_ids").sorted()
            for rec in self.search([])
        }


class ComboRuleItem(models.Model):

    _name = "combo.rule.item"
    _description = "Combo rule items to apply discounts on POS"

    rule_id = fields.Many2one(comodel_name="combo.rule", ondelete="cascade")

    category_ids = fields.Many2many(
        comodel_name="pos.category", string="Categories", required=True
    )

    discount_amount = fields.Float(string="Discount Amount", required=True)
