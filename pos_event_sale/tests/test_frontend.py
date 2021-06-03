# Copyright 2021 Camptocamp SA - Iván Todorovich
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from datetime import datetime

from odoo import fields
from odoo.tests import HttpCase, tagged


@tagged("post_install", "-at_install")
class TestUi(HttpCase):
    def setUp(self):
        super().setUp()
        # Use admin user
        self.env = self.env(
            user=self.env.ref("base.user_admin"),
            context=dict(self.env.context, tracking_disable=True),
        )
        # Configure pos.config.
        self.main_pos_config = self.env.ref("point_of_sale.pos_config_main")
        self.main_pos_config.iface_event_sale = True
        # Configure product
        self.product_event = self.env.ref("event_sale.product_product_event")
        self.product_event.available_in_pos = True
        # Create event
        self.event = self.env["event.event"].create(
            {
                "name": "Test PoS Event",
                "event_type_id": self.env.ref("event_sale.event_type_data_sale").id,
                "date_begin": datetime.combine(
                    fields.Date.today(), datetime.min.time()
                ),
                "date_end": datetime.combine(fields.Date.today(), datetime.max.time()),
            }
        )
        self.ticket = self.env["event.event.ticket"].create(
            {
                "name": "Test PoS Ticket",
                "product_id": self.product_event.id,
                "event_id": self.event.id,
                "price": 15.00,
            }
        )
        self.event.button_confirm()
        # Open Point of Sale
        self.main_pos_config.open_session_cb()
        # needed because tests are run before the module is marked as
        # installed. In js web will only load qweb coming from modules
        # that are returned by the backend in module_boot. Without
        # this you end up with js, css but no qweb.
        self.env.ref("base.module_pos_event_sale").state = "installed"

    def test_pos_event_sale_basic_tour(self):
        """PoS Events Basic Tour"""
        self.start_tour(
            "/pos/web?config_id=%d" % self.main_pos_config.id,
            "PosEventTourBasic",
            login="admin",
        )
        # Check PoS Order (last created order)
        pos_order = self.env["pos.order"].search([], order="id desc", limit=1)
        # Check registrations
        self.assertEqual(pos_order.event_registrations_count, 3)
        self.assertEqual(pos_order.event_registration_ids[0].state, "open")
        # Check action open registrations
        action = pos_order.action_open_event_registrations()
        self.assertEqual(action["type"], "ir.actions.act_window")
