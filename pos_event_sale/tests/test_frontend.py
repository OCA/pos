# Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
# @author Iván Todorovich <ivan.todorovich@camptocamp.com>
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
                "date_begin": datetime.combine(
                    fields.Date.today(), datetime.min.time()
                ),
                "date_end": datetime.combine(fields.Date.today(), datetime.max.time()),
                "stage_id": cls.env.ref("event.event_stage_booked").id,
                "seats_limited": True,
                "seats_max": 10,
            }
        )
        cls.ticket_kids = cls.env["event.event.ticket"].create(
            {
                "name": "Kids",
                "product_id": cls.product_event.id,
                "event_id": cls.event.id,
                "price": 0.0,
                "seats_limited": True,
                "seats_max": 5,
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

    def test_pos_event_sale_basic_tour(self):
        self.main_pos_config.open_session_cb(check_coa=False)
        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "EventSaleTour",
            login="accountman",
        )
        # Check POS Order (last created order)
        pos_order = self.env["pos.order"].search([], order="id desc", limit=1)
        # Check registrations
        self.assertEqual(pos_order.event_registrations_count, 3)
        for reg in pos_order.event_registration_ids:
            self.assertEqual(reg.state, "open")
        # Check action open registrations
        action = pos_order.action_open_event_registrations()
        self.assertEqual(action["type"], "ir.actions.act_window")
        # Total sold amount for the event
        self.assertEqual(self.event.pos_price_subtotal, 30.0)
        action = self.event.action_view_pos_orders()
        self.assertEqual(self.env["pos.order"].search(action["domain"]), pos_order)
        # Refund the order
        refund = self.env["pos.order"].browse(pos_order.refund()["res_id"])
        # Pay the refund
        self.env["pos.make.payment"].with_context(
            active_ids=refund.ids,
            active_id=refund.id,
            active_model=refund._name,
        ).create(
            {
                "payment_method_id": self.main_pos_config.payment_method_ids[0].id,
                "amount": refund.amount_total,
            }
        ).check()
        for reg in pos_order.event_registration_ids:
            self.assertEqual(reg.state, "cancel")

    def test_pos_event_sale_availability_tour(self):
        self.event.seats_max = 5
        self.ticket_kids.seats_max = 3
        self.main_pos_config.open_session_cb(check_coa=False)
        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "EventSaleAvailabilityTour",
            login="accountman",
        )
