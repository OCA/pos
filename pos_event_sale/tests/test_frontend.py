# Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
# @author Iván Todorovich <ivan.todorovich@camptocamp.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tests import tagged

from .common import TestPoSEventHttpCommon


@tagged("post_install", "-at_install")
class TestPoSEventHttp(TestPoSEventHttpCommon):
    def test_pos_event_sale_basic_tour(self):
        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "EventSaleTour",
            login="accountman",
        )
        order = self.env["pos.order"].search([], order="id desc", limit=1)
        self.assertTrue(
            all(reg.state == "open" for reg in order.event_registration_ids),
            "Registrations should be confirmed",
        )

    def test_pos_event_sale_availability_tour(self):
        self.event.seats_max = 5
        self.ticket_kids.seats_max = 3
        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "EventSaleAvailabilityTour",
            login="accountman",
        )
