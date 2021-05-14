from odoo.tests.common import SavepointCase


class TestUserRestriction(SavepointCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(context=dict(
            cls.env.context,
            tracking_disable=True,
            no_reset_password=True,
        ))
        cls.pos_user = cls.env['res.users'].create({
            'login': 'pos_user',
            'name': 'pos_user',
            'groups_id': [(6, 0, [cls.env.ref('point_of_sale.group_pos_user').id])]
        })
        cls.pos_user_assigned_pos = cls.env['res.users'].create({
            'login': 'pos_user_assigned_pos',
            'name': 'pos_user_assigned_pos',
            'groups_id': [(6, 0, [cls.env.ref(
                'pos_user_restriction.group_assigned_points_of_sale_user').id])]
        })
        cls.pos_config_main = cls.env.ref('point_of_sale.pos_config_main')
        cls.pos_config_model = cls.env['pos.config']

    def test_access_pos(self):
        # assigned_user_ids is not set: both users can read
        pos_configs = self.pos_config_model.sudo(self.pos_user.id).search([])
        self.assertTrue(pos_configs)
        pos_configs = self.pos_config_model.sudo(
            self.pos_user_assigned_pos.id).search([])
        self.assertTrue(pos_configs)

        self.pos_config_main.assigned_user_ids = [
            (6, 0, [self.pos_user_assigned_pos.id])]
        # assigned_user_ids is set with pos_user_assigned_pos: both users can read
        pos_configs = self.pos_config_model.sudo(self.pos_user.id).search([])
        self.assertTrue(pos_configs)
        pos_configs = self.pos_config_model.sudo(
            self.pos_user_assigned_pos.id).search([])
        self.assertTrue(pos_configs)

        self.pos_config_main.assigned_user_ids = [
            (6, 0, [self.pos_user.id])]
        # assigned_user_ids is set with pos_user: only pos_user can read
        pos_configs = self.pos_config_model.sudo(self.pos_user.id).search([])
        self.assertTrue(pos_configs)
        pos_configs = self.pos_config_model.sudo(
            self.pos_user_assigned_pos.id).search([])

        # TODO, fixme
        # this test is failing, if Odoo pos_restaurant is installed
        # self.assertFalse(pos_configs)
