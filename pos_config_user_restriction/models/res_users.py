# Copyright 2026 Saad Elbahi
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import api, fields, models


class ResUsers(models.Model):
    _inherit = "res.users"

    allowed_pos_config_ids = fields.Many2many(
        "pos.config",
        "res_users_allowed_pos_config_rel",
        "user_id",
        "pos_config_id",
        string="Allowed Points of Sale",
        help=(
            "When set, restricts user access to the selected POS configurations. "
            "Leave empty to allow all."
        ),
    )
    hide_pos_config_menus = fields.Boolean(
        string="Hide POS Configuration Menus",
        default=False,
        help=(
            "Hide Point of Sale configuration menus for this user while keeping "
            "cashier and session operations."
        ),
    )

    @api.onchange("allowed_pos_config_ids")
    def _onchange_allowed_pos_config_ids(self):
        if self.allowed_pos_config_ids and not self._origin.allowed_pos_config_ids:
            self.hide_pos_config_menus = True
        elif not self.allowed_pos_config_ids:
            self.hide_pos_config_menus = False

    @api.model_create_multi
    def create(self, vals_list):
        users = super().create(vals_list)
        if any(
            vals.get("allowed_pos_config_ids") or vals.get("hide_pos_config_menus")
            for vals in vals_list
        ):
            self.env.registry.clear_cache()
        return users

    def write(self, vals):
        res = super().write(vals)
        if "allowed_pos_config_ids" in vals or "hide_pos_config_menus" in vals:
            self.env.registry.clear_cache()
        return res
