from odoo import fields
from odoo.tests.common import SavepointCase


class TestPosDefaultPartner(SavepointCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.config = cls.env["pos.config"].create({"name": "DEMO Config"})
        cls.PosOrder = cls.env["pos.order"]
        cls.AccountPayment = cls.env["account.payment"]

        # Get Object
        cls.pos_product = cls.env["product.product"].create(
            {"name": "Test POS Product"}
        )
        cls.pricelist = cls.env["product.pricelist"].create(
            {
                "name": "Test pricelist",
                "currency_id": cls.env.user.company_id.currency_id.id,
                "item_ids": [
                    (
                        0,
                        0,
                        {
                            "applied_on": "3_global",
                            "compute_price": "formula",
                            "base": "list_price",
                        },
                    )
                ],
            }
        )
        cls.partner_01 = cls.env["res.partner"].create({"name": "Test partner 1"})
        cls.partner_02 = cls.env["res.partner"].create({"name": "Test partner 2"})

    def _create_order(self, partner_id=False):
        self.config.open_session_cb()
        session = self.config.current_session_id
        account_receivable_id = (
            self.env.user.partner_id.property_account_receivable_id.id
        )
        payment_methods = session.payment_method_ids
        # Create order
        order_data = {
            "id": "0006-001-0010",
            "to_invoice": True,
            "data": {
                "pricelist_id": self.pricelist.id,
                "user_id": 1,
                "name": "Order 0006-001-0010",
                "partner_id": partner_id,
                "amount_paid": 0.9,
                "pos_session_id": session.id,
                "lines": [
                    [
                        0,
                        0,
                        {
                            "product_id": self.pos_product.id,
                            "price_unit": 0.9,
                            "qty": 1,
                            "price_subtotal": 0.9,
                            "price_subtotal_incl": 0.9,
                        },
                    ]
                ],
                "statement_ids": [
                    [
                        0,
                        0,
                        {
                            "journal_id": session.statement_ids[0].journal_id.id,
                            "amount": 0.9,
                            "name": fields.Datetime.now(),
                            "account_id": account_receivable_id,
                            "statement_id": session.statement_ids[0].id,
                            "payment_method_id": payment_methods.filtered(
                                lambda pm: pm.is_cash_count
                                and not pm.split_transactions
                            )[0].id,
                        },
                    ]
                ],
                "creation_date": u"2018-09-27 15:51:03",
                "amount_tax": 0,
                "fiscal_position_id": False,
                "uid": u"00001-001-0001",
                "amount_return": 0,
                "sequence_number": 1,
                "amount_total": 0.9,
            },
        }

        result = self.PosOrder.create_from_ui([order_data])
        order = self.PosOrder.browse(result[0]["id"])
        return order

    def test_no_default_partner(self):
        order = self._create_order()
        self.assertTrue(order)
        self.assertFalse(order.partner_id)

    def test_no_default_partner_assigned_partner(self):
        order = self._create_order(self.partner_01.id)
        self.assertTrue(order)
        self.assertEqual(order.partner_id, self.partner_01)

    def test_default_partner(self):
        self.config.default_partner_id = self.partner_02
        order = self._create_order()
        self.assertTrue(order)
        self.assertEqual(order.partner_id, self.partner_02)

    def test_default_partner_assigned_partner(self):
        self.config.default_partner_id = self.partner_02
        order = self._create_order(self.partner_01.id)
        self.assertTrue(order)
        self.assertEqual(order.partner_id, self.partner_01)
