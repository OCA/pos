from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@tagged("post_install", "-at_install")
class TestHacks(TestPoSCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(
            context=dict(
                cls.env.context,
                tracking_disable=True,
                no_reset_password=True,
            )
        )
        cls.pos_user_assigned_pos = cls.env["res.users"].create(
            {
                "login": "pos_user_assigned_pos",
                "name": "pos_user_assigned_pos",
                "groups_id": [
                    (
                        6,
                        0,
                        [
                            cls.env.ref(
                                "pos_user_restriction.group_assigned_points_of_sale_user"
                            ).id
                        ],
                    )
                ],
            }
        )
        cls.config = cls.basic_config

    def test_get_closing_control_data(self):
        restricted_user = self.pos_user_assigned_pos
        self.config.assigned_user_ids = [(6, 0, [restricted_user.id])]

        session = self.open_new_session()

        # make sure it does raise AccessError
        session.with_user(restricted_user).get_closing_control_data()

    def test_validate_session(self):
        restricted_user = self.pos_user_assigned_pos

        self.config.assigned_user_ids = [(6, 0, [restricted_user.id])]
        self.product_id = self.env["product.product"].create(
            {"name": "Test POS", "available_in_pos": True, "list_price": 200}
        )

        session = self.open_new_session()
        self.pos_order_pos1 = self.env["pos.order"].create(
            {
                "company_id": self.env.company.id,
                "session_id": session.id,
                "partner_id": self.env.user.id,
                "lines": [
                    (
                        0,
                        0,
                        {
                            "name": "Test/0001",
                            "product_id": self.product_id.id,
                            "price_unit": 200,
                            "qty": 1.0,
                            "price_subtotal": 200,
                            "price_subtotal_incl": 200,
                        },
                    )
                ],
                "amount_tax": 0.0,
                "amount_total": 200,
                "amount_paid": 0.0,
                "amount_return": 0.0,
                "last_order_preparation_change": "{}",
            }
        )
        context_make_payment = {
            "active_ids": [self.pos_order_pos1.id],
            "active_id": self.pos_order_pos1.id,
        }
        self.pos_make_payment = (
            self.env["pos.make.payment"]
            .with_context(**context_make_payment)
            .create(
                {
                    "amount": 200,
                }
            )
        )
        context_payment = {"active_id": self.pos_order_pos1.id}
        self.pos_make_payment.with_context(**context_payment).check()

        # make sure it doesn't raise AccessError
        session.with_user(restricted_user).action_pos_session_closing_control()
