import odoo
from odoo import SUPERUSER_ID, api, fields
from odoo.tests import new_test_user
from odoo.tests.common import get_db_name

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


def get_test_chart_template_ref():
    """Return the chart template to run the accounting tests with.

    ``AccountTestInvoicingCommon`` only looks for the generic chart of
    accounts and skips every test without it. When another installed addon
    depends on a localization (as in the OCA CI, where an addon of this
    repository depends on ``l10n_fr``), ``account`` does not install the
    generic chart, so fall back to any installed chart template.
    """
    with odoo.registry(get_db_name()).cursor() as cr:
        env = api.Environment(cr, SUPERUSER_ID, {})
        template = env.ref(
            "l10n_generic_coa.configurable_chart_template", raise_if_not_found=False
        ) or env["account.chart.template"].search([], order="id", limit=1)
        return template.get_external_id().get(template.id) or None


class TestPosPaymentFeeCommon(TestPoSCommon):
    @classmethod
    def setUpClass(cls, chart_template_ref=None):
        super().setUpClass(
            chart_template_ref=chart_template_ref or get_test_chart_template_ref()
        )
        cls.env = cls.env(context=dict(cls.env.context, tracking_disable=True))
        cls.fee_account = cls.env["account.account"].create(
            {
                "name": "Bank Fees",
                "code": "FEE001",
                "account_type": "expense",
                "company_id": cls.company.id,
            }
        )
        cls.fee_account_2 = cls.fee_account.copy(
            {"code": "FEE002", "name": "Platform Fees"}
        )
        cls.misc_journal = cls.company_data["default_journal_misc"]
        cls.fee_journal_2 = cls.env["account.journal"].create(
            {
                "name": "Card Fees",
                "code": "CFEE",
                "type": "general",
                "company_id": cls.company.id,
            }
        )
        cls.product = cls.create_product("Fee Product", cls.categ_basic, 100.0)
        cls.bank_pm1.use_transaction_fees = True
        cls.pos_user = new_test_user(
            cls.env,
            login="fee_pos_user",
            groups="base.group_user,point_of_sale.group_pos_user",
            company_id=cls.company.id,
            company_ids=[(6, 0, cls.company.ids)],
        )
        cls.pos_manager = new_test_user(
            cls.env,
            login="fee_pos_manager",
            groups="base.group_user,point_of_sale.group_pos_manager",
            company_id=cls.company.id,
            company_ids=[(6, 0, cls.company.ids)],
        )

    def setUp(self):
        super().setUp()
        self.config = self.basic_config

    @classmethod
    def _create_rule(cls, method=None, **values):
        vals = {
            "name": "Card fee",
            "payment_method_id": (method or cls.bank_pm1).id,
            "fee_type": "percentage",
            "amount": 1.5,
            "account_id": cls.fee_account.id,
            "journal_id": cls.misc_journal.id,
            "posting_policy": "session_close",
        }
        vals.update(values)
        return cls.env["pos.payment.method.fee"].create(vals)

    def _sync_order(self, payments, quantity=1, draft=False, uid=None, user=None):
        """Synchronise an order as the POS UI does and return it."""
        order_data = self.create_ui_order_data(
            [(self.product, quantity)], payments=payments, uid=uid
        )
        order_model = self.env["pos.order"]
        if user:
            order_model = order_model.with_user(user)
        result = order_model.create_from_ui([order_data], draft=draft)
        return self.env["pos.order"].browse(result[0]["id"])

    def _close_session(self, user=None):
        session = self.pos_session
        if user:
            session = session.with_user(user)
        cash_pm = session.payment_method_ids.filtered("is_cash_count")[:1]
        cash_total = sum(
            self.pos_session.order_ids.payment_ids.filtered(
                lambda payment: payment.payment_method_id == cash_pm
            ).mapped("amount")
        )
        session.post_closing_cash_details(cash_total)
        result = session.close_session_from_ui()
        self.assertTrue(result["successful"], result)
        return result

    def _fee_moves(self, session=None):
        return (session or self.pos_session).fee_line_ids.move_id

    @staticmethod
    def _today_for(record, timestamp):
        return fields.Date.context_today(record, timestamp=timestamp)
