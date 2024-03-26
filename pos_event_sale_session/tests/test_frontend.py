# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Iván Todorovich <ivan.todorovich@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from datetime import datetime

from odoo import fields
from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestUi(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls, **kwargs):
        super().setUpClass(**kwargs)
        cls.env.user.groups_id += cls.env.ref("event.group_event_user")
        cls.main_pos_config.iface_event_sale = True
        # Configure product
        cls.product_event = cls.env.ref("event_sale.product_product_event")
        cls.product_event.active = True
        cls.product_event.available_in_pos = True
        # Create event
        cls.event = cls.env["event.event"].create(
            {
                "name": "Les Misérables",
                "event_type_id": cls.env.ref("event.event_type_0").id,
                "use_sessions": True,
                "stage_id": cls.env.ref("event.event_stage_booked").id,
                "seats_limited": True,
                "seats_max": 5,
            }
        )
        cls.ticket_kids = cls.env["event.event.ticket"].create(
            {
                "name": "Kids",
                "product_id": cls.product_event.id,
                "event_id": cls.event.id,
                "price": 0.0,
            }
        )
        cls.ticket_regular = cls.env["event.event.ticket"].create(
            {
                "name": "Standard",
                "product_id": cls.product_event.id,
                "event_id": cls.event.id,
                "price": 15.0,
            }
        )
        # Create sessions
        # Both at the same time and the whole day to avoid issues
        # with current time (during tests)
        date_begin = datetime.combine(fields.Date.today(), datetime.min.time())
        date_end = datetime.combine(fields.Date.today(), datetime.max.time())
        cls.sessions = cls.env["event.session"].create(
            [
                {
                    "event_id": cls.event.id,
                    "date_begin": date_begin,
                    "date_end": date_end,
                },
                {
                    "event_id": cls.event.id,
                    "date_begin": date_begin,
                    "date_end": date_end,
                },
            ]
        )

    def test_pos_event_sale_basic_tour(self):
        self.main_pos_config.open_session_cb(check_coa=False)
        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "EventSaleSessionTour",
            login="accountman",
        )
        # Check POS Order (last created order)
        pos_order = self.env["pos.order"].search([], order="id desc", limit=1)
        # Check registrations
        self.assertEqual(pos_order.event_registrations_count, 5)
        self.assertEqual(pos_order.event_registration_ids.session_id, self.sessions)
        for reg in pos_order.event_registration_ids:
            self.assertEqual(reg.state, "open")
        # Total sold amount for the event and sessions
        self.assertEqual(self.event.pos_price_subtotal, 45.0)
        self.assertEqual(self.sessions[0].pos_price_subtotal, 15.0)
        self.assertEqual(self.sessions[1].pos_price_subtotal, 30.0)
