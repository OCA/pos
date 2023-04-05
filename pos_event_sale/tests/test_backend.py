# Copyright 2023 Camptocamp SA (https://www.camptocamp.com).
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tests import tagged

from .common import TestPoSEventCommon


@tagged("post_install", "-at_install")
class TestPoSEvent(TestPoSEventCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.order = cls._create_from_ui(
            dict(
                event_lines=[
                    dict(ticket=cls.ticket_kids, quantity=2),
                    dict(ticket=cls.ticket_regular, quantity=1),
                ]
            )
        )

    def test_action_open_registrations(self):
        action = self.order.action_open_event_registrations()
        self.assertEqual(action["type"], "ir.actions.act_window")

    def test_event_pos_price_subtotal(self):
        self.assertEqual(self.event.pos_price_subtotal, self.order.amount_total)

    def test_event_action_view_pos_orders(self):
        action = self.event.action_view_pos_orders()
        self.assertEqual(self.env["pos.order"].search(action["domain"]), self.order)

    def test_order_refund(self):
        refund = self.env["pos.order"].browse(self.order.refund()["res_id"])
        self.env["pos.make.payment"].with_context(
            active_ids=refund.ids,
            active_id=refund.id,
            active_model=refund._name,
        ).create(
            {
                "payment_method_id": self.config.payment_method_ids[0].id,
                "amount": refund.amount_total,
            }
        ).check()
        self.assertTrue(
            all(reg.state == "cancel" for reg in self.order.event_registration_ids)
        )

    def test_order_cancel(self):
        done_registrations = self.order.event_registration_ids[-2:]
        open_registrations = self.order.event_registration_ids - done_registrations
        done_registrations.action_set_done()
        self.order.action_pos_order_cancel()
        self.assertTrue(
            all(reg.state == "cancel" for reg in open_registrations),
            "Open registrations should be cancelled with the order",
        )
        self.assertTrue(
            all(reg.state == "done" for reg in done_registrations),
            "Done registrations should remain done",
        )

    def test_order_with_negated_registrations(self):
        order = self._create_from_ui(
            dict(
                event_lines=[
                    dict(ticket=self.ticket_kids, quantity=2),
                    dict(ticket=self.ticket_kids, quantity=-2),
                    dict(ticket=self.ticket_regular, quantity=1),
                ]
            )
        )
        kids_registrations = order.event_registration_ids.filtered(
            lambda r: r.event_ticket_id == self.ticket_kids
        )
        self.assertEqual(len(kids_registrations), 2)
        self.assertTrue(
            all(reg.state == "cancel" for reg in kids_registrations),
            "Kids registrations should be cancelled (negated)",
        )
        regular_registrations = order.event_registration_ids.filtered(
            lambda r: r.event_ticket_id == self.ticket_regular
        )
        self.assertEqual(len(regular_registrations), 1)
        self.assertTrue(
            all(reg.state == "open" for reg in regular_registrations),
            "Regular registrations should be confirmed",
        )
