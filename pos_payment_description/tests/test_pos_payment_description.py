from odoo.tests import tagged
from odoo.tools import formatLang

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@tagged("post_install", "-at_install")
class TestPosPaymentDescription(TestPoSCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.config = cls.basic_config
        cls.cash_payment_method = cls.cash_pm1
        cls.cash_journal = cls.cash_payment_method.journal_id
        cls.pay_later_payment_method = cls.env["pos.payment.method"].create(
            {
                "name": "Customer Account Test",
                "company_id": cls.env.company.id,
            }
        )
        cls.product = cls.env["product.product"].create(
            {
                "name": "POS Payment Description Product",
                "available_in_pos": True,
                "list_price": 30.0,
                "taxes_id": False,
            }
        )

    def setUp(self):
        super().setUp()
        self.config = self.basic_config
        self.config.write(
            {
                "payment_method_ids": [
                    (
                        6,
                        0,
                        (
                            self.config.payment_method_ids
                            | self.pay_later_payment_method
                        ).ids,
                    )
                ]
            }
        )
        self.open_new_session()

    def _create_order(self):
        return self.env["pos.order"].create(
            {
                "company_id": self.env.company.id,
                "session_id": self.pos_session.id,
                "partner_id": self.env.user.partner_id.id,
                "lines": [
                    (
                        0,
                        0,
                        {
                            "name": "Test/0001",
                            "product_id": self.product.id,
                            "price_unit": 30.0,
                            "qty": 1.0,
                            "price_subtotal": 30.0,
                            "price_subtotal_incl": 30.0,
                        },
                    )
                ],
                "amount_tax": 0.0,
                "amount_total": 30.0,
                "amount_paid": 0.0,
                "amount_return": 0.0,
                "last_order_preparation_change": "{}",
            }
        )

    def test_payment_description_with_and_without_journal(self):
        order = self._create_order()
        self.env["pos.payment"].create(
            {
                "pos_order_id": order.id,
                "amount": 10.0,
                "payment_method_id": self.cash_payment_method.id,
            }
        )
        self.env["pos.payment"].create(
            {
                "pos_order_id": order.id,
                "amount": 20.0,
                "payment_method_id": self.pay_later_payment_method.id,
            }
        )

        order.invalidate_recordset(["payment_ids", "payment_description"])
        order._compute_payment_description()

        expected_descriptions = sorted(
            [
                (
                    f"{self.cash_journal.code}: "
                    f"{formatLang(self.env, 10.0, currency_obj=order.currency_id)}"
                ),
                (
                    f"{self.pay_later_payment_method.name}: "
                    f"{formatLang(self.env, 20.0, currency_obj=order.currency_id)}"
                ),
            ]
        )
        self.assertEqual(order.payment_description, " - ".join(expected_descriptions))
