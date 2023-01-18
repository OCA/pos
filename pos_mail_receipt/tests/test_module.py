# Copyright 2019 Akretion (https://www.akretion.com).
# @author Pierrick Brun <pierrick.brun@akretion.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import mock

from odoo import fields
from odoo.tests.common import TransactionCase

wkhtmltopdf_method = (
    "odoo.addons.base.models.ir_actions_report.IrActionsReport._run_wkhtmltopdf"
)
DUMMY_BASE64_VALUE = b"c2FsdXRvbgo="


class TestModule(TransactionCase):
    def setUp(self):
        super(TestModule, self).setUp()
        self.PosOrder = self.env["pos.order"]
        self.pos_product = self.env.ref("point_of_sale.whiteboard_pen")
        self.pricelist = self.env.ref("product.list0")

        # Create a new pos config and open it
        self.pos_config = self.env.ref("point_of_sale.pos_config_main").copy()
        self.pos_config.open_session_cb()

    @mock.patch(wkhtmltopdf_method)
    def test_mail_before_order(self, wkhtmltopdf):
        wkhtmltopdf.return_value = DUMMY_BASE64_VALUE
        order = self._create_order(email="test_mail@example.org.tst")
        self.assert_sent(order)

    @mock.patch(wkhtmltopdf_method)
    def test_mail_after_order(self, wkhtmltopdf):
        wkhtmltopdf.return_value = DUMMY_BASE64_VALUE
        order = self._create_order()
        self.env["pos.order"].send_mail_receipt(
            order.pos_reference,
            "test_mail@example.org.tst",
            "<p>Receipt's HTML</p>",
            force=False,
        )
        self.assert_sent(order)
        self.env["pos.order"].send_mail_receipt(
            order.pos_reference,
            "test_mail@example.org.tst",
            "<p>Receipt's HTML</p>",
            force=False,
        )
        self.assert_sent(order)

    def assert_sent(self, order):
        mail = self.env["mail.mail"].search(
            [("model", "=", "pos.order"), ("res_id", "=", order.id)]
        )
        self.assertEqual(1, len(mail))
        self.assertEqual("test_mail@example.org.tst", mail.email_to)
        self.assertEqual(1, len(mail.attachment_ids))

    def _create_order(self, email=False):
        # Create order
        account = self.env.user.partner_id.property_account_receivable_id
        statement_ids = self.pos_config.current_session_id.statement_ids
        order_data = {
            "id": u"0006-001-0010",
            "to_invoice": False,
            "data": {
                "pricelist_id": self.pricelist.id,
                "user_id": 1,
                "name": "Order 0006-001-0010",
                "partner_id": False,
                "amount_paid": 0.9,
                "pos_session_id": self.pos_config.current_session_id.id,
                "lines": [
                    [
                        0,
                        0,
                        {
                            "product_id": self.pos_product.id,
                            "price_unit": self.pos_product.list_price,
                            "qty": 10,
                            "price_subtotal": 18.0,
                            "price_subtotal_incl": 18.0,
                        },
                    ]
                ],
                "statement_ids": [
                    [
                        0,
                        0,
                        {
                            "journal_id": self.pos_config.journal_ids[0].id,
                            "amount": 18.0,
                            "name": fields.Datetime.now(),
                            "account_id": account.id,
                            "statement_id": statement_ids[0].id,
                        },
                    ]
                ],
                "creation_date": u"2018-09-27 15:51:03",
                "amount_tax": 0,
                "fiscal_position_id": False,
                "uid": u"00001-001-0001",
                "amount_return": 0,
                "sequence_number": 1,
                "amount_total": 18.0,
            },
        }
        if email:
            order_data["data"]["email"] = email
            order_data["data"]["body_from_ui"] = "<p>Receipt's HTML</p>"

        result = self.PosOrder.create_from_ui([order_data])
        order = self.PosOrder.browse(result[0])
        return order
