# Copyright 2026 Saad Elbahi
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import api, models, tools


class IrUiMenu(models.Model):
    _inherit = "ir.ui.menu"

    @api.model
    @tools.ormcache("frozenset(self.env.user.groups_id.ids)", "self.env.uid", "debug")
    def _visible_menu_ids(self, debug=False):
        visible = super()._visible_menu_ids(debug=debug)
        user = self.env.user
        if not user.has_group("base.group_system") and user.hide_pos_config_menus:
            pos_cfg_menu = self.env.ref(
                "point_of_sale.menu_point_config_product", raise_if_not_found=False
            )
            if pos_cfg_menu:
                full_ctx = {"ir.ui.menu.full_list": True}
                hidden_ids = set(
                    self.with_context(**full_ctx)
                    .sudo()
                    .search([("id", "child_of", pos_cfg_menu.id)])
                    .ids
                )
                visible = visible - hidden_ids
        return visible
