# Copyright 2026 Saad Elbahi
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import Command
from odoo.tests import TransactionCase, tagged


@tagged("post_install", "-at_install")
class TestPosConfigUserRestriction(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.company = cls.env.company
        cls.pos_a = cls.env["pos.config"].create({"name": "Restricted POS A"})
        cls.pos_b = cls.env["pos.config"].create({"name": "Restricted POS B"})

        grp_user = cls.env.ref("base.group_user")
        grp_pos_mgr = cls.env.ref("point_of_sale.group_pos_manager")

        cls.restricted_user = cls.env["res.users"].create(
            {
                "name": "POS Branch Manager A",
                "login": "pos_branch_mgr_a",
                "groups_id": [Command.set([grp_user.id, grp_pos_mgr.id])],
                "company_id": cls.company.id,
                "company_ids": [Command.set([cls.company.id])],
                "allowed_pos_config_ids": [Command.set([cls.pos_a.id])],
                "hide_pos_config_menus": True,
            }
        )
        cls.open_user = cls.env["res.users"].create(
            {
                "name": "POS Global Manager",
                "login": "pos_global_mgr",
                "groups_id": [Command.set([grp_user.id, grp_pos_mgr.id])],
                "company_id": cls.company.id,
                "company_ids": [Command.set([cls.company.id])],
            }
        )

    def test_record_rule_isolates_pos_configs_and_sessions(self):
        visible_restricted = (
            self.env["pos.config"].with_user(self.restricted_user).search([])
        )
        self.assertIn(self.pos_a, visible_restricted)
        self.assertNotIn(self.pos_b, visible_restricted)

        visible_global = self.env["pos.config"].with_user(self.open_user).search([])
        self.assertIn(self.pos_a, visible_global)
        self.assertIn(self.pos_b, visible_global)

        sess_a = self.env["pos.session"].create({"config_id": self.pos_a.id})
        sess_b = self.env["pos.session"].create({"config_id": self.pos_b.id})
        visible_sessions = (
            self.env["pos.session"].with_user(self.restricted_user).search([])
        )
        self.assertIn(sess_a, visible_sessions)
        self.assertNotIn(sess_b, visible_sessions)

        self.restricted_user.write({"allowed_pos_config_ids": [Command.clear()]})
        all_visible = self.env["pos.config"].with_user(self.restricted_user).search([])
        self.assertIn(self.pos_b, all_visible)

    def test_hide_pos_config_menus_and_onchange(self):
        cfg_menu = self.env.ref("point_of_sale.menu_point_config_product")
        visible_ids = (
            self.env["ir.ui.menu"].with_user(self.restricted_user)._visible_menu_ids()
        )
        self.assertNotIn(cfg_menu.id, visible_ids)

        visible_global_ids = (
            self.env["ir.ui.menu"].with_user(self.open_user)._visible_menu_ids()
        )
        self.assertIn(cfg_menu.id, visible_global_ids)

        user_mem = self.env["res.users"].new(
            {"allowed_pos_config_ids": [Command.set([self.pos_a.id])]}
        )
        user_mem._onchange_allowed_pos_config_ids()
        self.assertTrue(user_mem.hide_pos_config_menus)
        user_mem.allowed_pos_config_ids = False
        user_mem._onchange_allowed_pos_config_ids()
        self.assertFalse(user_mem.hide_pos_config_menus)
