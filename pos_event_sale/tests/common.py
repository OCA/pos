# Copyright 2023 Camptocamp SA (https://www.camptocamp.com).
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from random import randint

from odoo import fields

from odoo.addons.point_of_sale.tests.common import TestPoSCommon
from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


class PosEventMixin:
    @classmethod
    def setUpData(cls):
        # Configure product
        cls.product_event = cls.env.ref("event_sale.product_product_event")
        cls.product_event.active = True
        cls.product_event.available_in_pos = True
        # Create event
        cls.event = cls.env["event.event"].create(
            {
                "name": "Les Misérables",
                "event_type_id": cls.env.ref("event.event_type_0").id,
                "date_begin": fields.Datetime.start_of(fields.Datetime.now(), "day"),
                "date_end": fields.Datetime.end_of(fields.Datetime.now(), "day"),
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


class TestPoSEventCommon(TestPoSCommon, PosEventMixin):
    @classmethod
    def setUpClass(cls, **kwargs):
        super().setUpClass(**kwargs)
        cls.setUpData()
        cls.env.user.groups_id += cls.env.ref("event.group_event_user")
        cls.basic_config.iface_event_sale = True
        cls.config = cls.basic_config
        # Open session
        cls.config.open_ui()
        cls.pos_session = cls.config.current_session_id
        cls.currency = cls.pos_session.currency_id
        cls.pricelist = cls.pos_session.config_id.pricelist_id
        cls.pos_session.set_cashbox_pos(0.0, None)
        # Used to generate unique order ids
        cls._nextId = 0

    @classmethod
    def _create_order_line_data(cls, product=None, quantity=1.0, discount=0.0, fp=None):
        cls._nextId += 1
        price_unit = cls.pricelist._get_product_price(product, quantity, False)
        tax_ids = fp.map_tax(product.taxes_id) if fp else product.taxes_id
        price_unit_after_discount = price_unit * (1 - discount / 100.0)
        tax_values = (
            tax_ids.compute_all(price_unit_after_discount, cls.currency, quantity)
            if tax_ids
            else {
                "total_excluded": price_unit * quantity,
                "total_included": price_unit * quantity,
            }
        )
        return {
            "discount": discount,
            "id": cls._nextId,
            "pack_lot_ids": [],
            "price_unit": price_unit,
            "product_id": product.id,
            "price_subtotal": tax_values["total_excluded"],
            "price_subtotal_incl": tax_values["total_included"],
            "qty": quantity,
            "tax_ids": [(6, 0, tax_ids.ids)],
        }

    @classmethod
    def _create_event_order_line_data(
        cls, ticket=None, quantity=1.0, discount=0.0, fp=None
    ):
        cls._nextId += 1
        product = ticket.product_id
        product_lst_price = product.lst_price
        product_price = cls.pricelist._get_product_price(product, quantity, False)
        price_unit = product_price / product_lst_price * ticket.price
        tax_ids = (
            fp.map_tax(ticket.product_id.taxes_id) if fp else ticket.product_id.taxes_id
        )
        price_unit_after_discount = price_unit * (1 - discount / 100.0)
        tax_values = (
            tax_ids.compute_all(price_unit_after_discount, cls.currency, quantity)
            if tax_ids
            else {
                "total_excluded": price_unit * quantity,
                "total_included": price_unit * quantity,
            }
        )
        return {
            "discount": discount,
            "id": cls._nextId,
            "pack_lot_ids": [],
            "price_unit": price_unit,
            "product_id": ticket.product_id.id,
            "price_subtotal": tax_values["total_excluded"],
            "price_subtotal_incl": tax_values["total_included"],
            "qty": quantity,
            "tax_ids": [(6, 0, tax_ids.ids)],
            "event_ticket_id": ticket.id,
        }

    @classmethod
    def _create_random_uid(cls):
        return "%05d-%03d-%04d" % (randint(1, 99999), randint(1, 999), randint(1, 9999))

    @classmethod
    def _create_order_data(
        cls,
        lines=None,
        event_lines=None,
        partner=False,
        is_invoiced=False,
        payments=None,
        uid=None,
    ):
        """Create a dictionary mocking data created by the frontend"""
        default_fiscal_position = cls.config.default_fiscal_position_id
        fiscal_position = (
            partner.property_account_position_id if partner else default_fiscal_position
        )
        uid = uid or cls._create_random_uid()
        # Lines
        order_lines = []
        if lines:
            order_lines.extend(
                [
                    cls._create_order_line_data(**line, fp=fiscal_position)
                    for line in lines
                ]
            )
        if event_lines:
            order_lines.extend(
                [
                    cls._create_event_order_line_data(**line, fp=fiscal_position)
                    for line in event_lines
                ]
            )
        # Payments
        total_amount_incl = sum(line["price_subtotal_incl"] for line in order_lines)
        if payments is None:
            default_cash_pm = cls.config.payment_method_ids.filtered(
                lambda pm: pm.is_cash_count
            )[:1]
            if not default_cash_pm:
                raise Exception(
                    "There should be a cash payment method set in the pos.config."
                )
            payments = [
                dict(
                    amount=total_amount_incl,
                    name=fields.Datetime.now(),
                    payment_method_id=default_cash_pm.id,
                )
            ]
        else:
            payments = [
                dict(amount=amount, name=fields.Datetime.now(), payment_method_id=pm.id)
                for pm, amount in payments
            ]
        # Order data
        total_amount_base = sum(line["price_subtotal"] for line in order_lines)
        return {
            "data": {
                "amount_paid": sum(payment["amount"] for payment in payments),
                "amount_return": 0,
                "amount_tax": total_amount_incl - total_amount_base,
                "amount_total": total_amount_incl,
                "creation_date": fields.Datetime.to_string(fields.Datetime.now()),
                "fiscal_position_id": fiscal_position.id,
                "pricelist_id": cls.config.pricelist_id.id,
                "lines": [(0, 0, line) for line in order_lines],
                "name": "Order %s" % uid,
                "partner_id": partner and partner.id,
                "pos_session_id": cls.pos_session.id,
                "sequence_number": 2,
                "statement_ids": [(0, 0, payment) for payment in payments],
                "uid": uid,
                "user_id": cls.env.user.id,
                "to_invoice": is_invoiced,
            },
            "id": uid,
            "to_invoice": is_invoiced,
        }

    @classmethod
    def _create_from_ui(cls, order_list, draft=False):
        if not isinstance(order_list, (list, tuple)):
            order_list = [order_list]
        order_data_list = [cls._create_order_data(**order) for order in order_list]
        res = cls.env["pos.order"].create_from_ui(order_data_list, draft=draft)
        order_ids = [order["id"] for order in res]
        return cls.env["pos.order"].browse(order_ids)


class TestPoSEventHttpCommon(TestPointOfSaleHttpCommon, PosEventMixin):
    @classmethod
    def setUpClass(cls, **kwargs):
        super().setUpClass(**kwargs)
        cls.setUpData()
        cls.env.user.groups_id += cls.env.ref("event.group_event_user")
        cls.main_pos_config.iface_event_sale = True
        cls.main_pos_config.open_ui()
