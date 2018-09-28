# Copyright 2004-2018 Odoo SA
# Copyright 2018 Lambda IS DOOEL <https://www.lambda-is.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.api import Environment
from odoo.tests import HttpCase


class TestPOSLoyalty(HttpCase):

    def test_pos_loyalty(self):
        cr = self.registry.cursor()
        assert cr == self.registry.test_cr
        env = Environment(cr, self.uid, {})
        main_pos_config = env.ref('point_of_sale.pos_config_main')
        target_product = env.ref('point_of_sale.peche')
        free_product = env.ref('point_of_sale.Onions')
        customer = env.ref('base.res_partner_2')
        loyalty_program = env['loyalty.program'].create({
            'name': 'foo',
            'rule_ids': [(0, 0, {
                'name': 'Peaches',
                'type': 'product',
                'product_id': target_product.id,
                'pp_product': 10,
            })],
            'reward_ids': [(0, 0, {
                'name': 'Free Peaches',
                'type': 'gift',
                'gift_product_id': target_product.id,
                'point_cost': 20,
                'minimum_points': 20,
            }), (0, 0, {
                'name': 'Free Onions',
                'type': 'gift',
                'gift_product_id': free_product.id,
                'point_cost': 20,
                'minimum_points': 20,
            })]
        })
        main_pos_config.write({'loyalty_id': loyalty_program.id})
        main_pos_config.open_session_cb()

        # needed because tests are run before the module is marked as
        # installed. In js web will only load qweb coming from modules
        # that are returned by the backend in module_boot. Without
        # this you end up with js, css but no qweb.
        env['ir.module.module'].search(
            [('name', '=', 'pos_loyalty')], limit=1).state = 'installed'

        cr.release()

        # Process an order with 2kg of Peaches which should
        # add 20 loyalty points
        self.phantom_js("/pos/web",
                        "odoo.__DEBUG__.services['web_tour.tour'].run("
                        "'test_pos_loyalty_acquire_points')",
                        "odoo.__DEBUG__.services['web_tour.tour'].tours"
                        ".test_pos_loyalty_acquire_points.ready",
                        login="admin")

        self.assertEqual(customer.loyalty_points, 20)

        # Spend 20 loyalty points on "Free Peaches" reward
        self.phantom_js("/pos/web",
                        "odoo.__DEBUG__.services['web_tour.tour'].run("
                        "'test_pos_loyalty_spend_points')",
                        "odoo.__DEBUG__.services['web_tour.tour'].tours"
                        ".test_pos_loyalty_spend_points.ready",
                        login="admin")

        customer_points = customer.read(
            ['loyalty_points'])[0]['loyalty_points']
        self.assertEqual(customer_points, 0)
