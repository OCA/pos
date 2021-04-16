# Copyright 2004-2018 Odoo SA
# Copyright 2018 Lambda IS DOOEL <https://www.lambda-is.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import odoo.tests


class TestPOSLoyalty(odoo.tests.HttpCase):
    def test_pos_loyalty(self):
        env = self.env(user=self.env.ref("base.user_admin"))

        main_pos_config = env.ref("point_of_sale.pos_config_main")

        # Disabile "use_proxy", see point_of_sale/static/src/js/models.js
        main_pos_config.iface_payment_terminal = False
        main_pos_config.iface_electronic_scale = False
        main_pos_config.iface_print_via_proxy = False
        main_pos_config.iface_scan_via_proxy = False
        main_pos_config.iface_cashdrawer = False
        main_pos_config.iface_customer_facing_display = False

        # module pos_customer_display
        if hasattr(main_pos_config, "iface_customer_display"):
            main_pos_config.iface_customer_display = False
        pos_categ_chairs = env.ref("point_of_sale.pos_category_chairs")
        letter_tray = env["product.product"].create(
            {
                "name": "Letter Tray",
                "available_in_pos": True,
                "list_price": 4.80,
                "taxes_id": False,
                "pos_categ_id": pos_categ_chairs.id,
            }
        )
        free_product = env.ref("point_of_sale.desk_organizer")
        customer = env.ref("base.res_partner_2")
        loyalty_program = env["loyalty.program"].create(
            {
                "name": "foo",
                "rule_ids": [
                    (
                        0,
                        0,
                        {
                            "name": "Peaches",
                            "type": "product",
                            "product_id": letter_tray.id,
                            "pp_product": 10,
                        },
                    )
                ],
                "reward_ids": [
                    (
                        0,
                        0,
                        {
                            "name": "Free Letter Tray",
                            "type": "gift",
                            "gift_product_id": letter_tray.id,
                            "point_cost": 20,
                            "minimum_points": 20,
                        },
                    ),
                    (
                        0,
                        0,
                        {
                            "name": "Free Desk Organizer",
                            "type": "gift",
                            "gift_product_id": free_product.id,
                            "point_cost": 20,
                            "minimum_points": 20,
                        },
                    ),
                ],
            }
        )
        main_pos_config.write({"loyalty_id": loyalty_program.id})
        main_pos_config.open_session_cb()

        # needed because tests are run before the module is marked as
        # installed. In js web will only load qweb coming from modules
        # that are returned by the backend in module_boot. Without
        # this you end up with js, css but no qweb.
        env["ir.module.module"].search(
            [("name", "=", "pos_loyalty")], limit=1
        ).state = "installed"

        # Process an order with 2kg of Peaches which should
        # add 20 loyalty points
        self.phantom_js(
            "/pos/web",
            "odoo.__DEBUG__.services['web_tour.tour']."
            "run('test_pos_loyalty_acquire_points')",
            "odoo.__DEBUG__.services['web_tour.tour']."
            "tours.test_pos_loyalty_acquire_points.ready",
            login="admin",
        )

        self.assertEqual(customer.loyalty_points, 20)

        # Spend 20 loyalty points on "Free Peaches" reward
        self.phantom_js(
            "/pos/web",
            "odoo.__DEBUG__.services['web_tour.tour'].run("
            "'test_pos_loyalty_spend_points')",
            "odoo.__DEBUG__.services['web_tour.tour'].tours"
            ".test_pos_loyalty_spend_points.ready",
            login="admin",
        )

        customer_points = customer.read(["loyalty_points"])[0]["loyalty_points"]
        self.assertEqual(customer_points, 0)
