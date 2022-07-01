# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Iván Todorovich <ivan.todorovich@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from datetime import datetime

from odoo import fields
from odoo.tests import RecordCapturer, tagged

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
                "price": 5.0,
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
        # Create a sale.order
        cls.partner = cls.env.ref("base.res_partner_1")
        cls.order = cls.env["sale.order"].create(
            {
                "name": "TEST01",
                "partner_id": cls.partner.id,
                "order_line": [
                    fields.Command.create(
                        {
                            "name": cls.ticket_regular.display_name,
                            "product_id": cls.ticket_regular.product_id.id,
                            "event_id": cls.event.id,
                            "event_ticket_id": cls.ticket_regular.id,
                            "price_unit": cls.ticket_regular.price,
                            "product_uom_qty": 2,
                        }
                    ),
                    fields.Command.create(
                        {
                            "name": cls.ticket_kids.display_name,
                            "product_id": cls.ticket_kids.product_id.id,
                            "event_id": cls.event.id,
                            "event_ticket_id": cls.ticket_kids.id,
                            "price_unit": cls.ticket_kids.price,
                            "product_uom_qty": 1,
                        }
                    ),
                ],
            }
        )

    def _test_pos_sale_import_tour(self):
        self.main_pos_config.open_session_cb(check_coa=False)
        with RecordCapturer(self.env["pos.order"], []) as rc:
            self.start_tour(
                f"/pos/ui?config_id={self.main_pos_config.id}",
                "PosEventSaleImportTour",
                login="accountman",
            )
        pos_orders = rc.records
        origin_sale_orders = pos_orders.lines.sale_order_origin_id
        self.assertEqual(len(pos_orders), 2, "2 orders created")
        self.assertEqual(origin_sale_orders, self.order, "linked to so")
        registrations = pos_orders.event_registration_ids
        self.assertEqual(len(registrations), 3, "3 registrations")
        for registration in registrations:
            self.assertEqual(registration.event_id, self.event)
            # Check that the registration is linked to both pos and sale orders
            self.assertTrue(registration.sale_order_line_id)
            self.assertTrue(registration.pos_order_line_id)
            # Check that both pos and sale lines are linked
            self.assertEqual(
                registration.pos_order_line_id.sale_order_line_id,
                registration.sale_order_line_id,
            )
            # Check that the event is the one in the SO
            self.assertEqual(
                registration.event_id,
                registration.sale_order_line_id.event_id,
            )
            # Check that the event ticket is the one in the SO
            self.assertEqual(
                registration.event_ticket_id,
                registration.sale_order_line_id.event_ticket_id,
            )
            # Check that the registration is confirmed
            self.assertEqual(registration.state, "open")

    def test_pos_sale_import_draft_tour(self):
        """Test flow with a draft sale order (Quotation)"""
        self._test_pos_sale_import_tour()

    def test_pos_sale_import_confirmed_tour(self):
        """Test flow with a confirmed sale order"""
        self.order.action_confirm()
        self._test_pos_sale_import_tour()
