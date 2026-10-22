# Copyright 2026 Cetmix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import logging

from odoo import fields
from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon

_logger = logging.getLogger(__name__)


@tagged("post_install", "-at_install")
class TestPosMultiCurrencyFrontend(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls, chart_template_ref=None):
        super().setUpClass(chart_template_ref=chart_template_ref)
        cls.currency_f = cls.env["res.currency"].create(
            {
                "name": "F",
                "symbol": "F",
                "rounding": 0.01,
                "rate_ids": [
                    (
                        0,
                        0,
                        {
                            "rate": 1 / 4.40,
                            "name": fields.Date.today(),
                            "company_id": cls.env.company.id,
                        },
                    )
                ],
            }
        )
        cls.env["product.product"].create(
            {
                "name": "Foreign tender product",
                "available_in_pos": True,
                "list_price": 220.0,
                "taxes_id": [(5, 0, 0)],
                "type": "consu",
            }
        )
        cls.main_pos_config.foreign_currency_ids = cls.currency_f

    def _start_pos_tour(self, tour_name):
        """Open the Point of Sale and run one tour.

        On OCB, Chrome sometimes accepts the debugger connection and then
        never answers ``Page.navigate``. The server is idle, and the next
        browser opens the same page, so the tour is tried once more.

        :param str tour_name: name of the web tour
        :raise TimeoutError: Chrome did not open the page on the second try
        """
        url = "/pos/ui?config_id=%s" % self.main_pos_config.id
        try:
            self.start_tour(url, tour_name, login="pos_user")
        except TimeoutError:
            _logger.warning(
                "Retrying %s after Chrome did not open the Point of Sale", tour_name
            )
            self.start_tour(url, tour_name, login="pos_user")

    def test_foreign_tender_tour(self):
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self._start_pos_tour("PosMultiCurrencyPaymentTour")

    def test_comma_decimal_keypad_tour(self):
        # Italian parses "." as a thousands separator. The keypad must keep
        # the comma, and +10 must add ten rather than drop that separator.
        self.env["res.lang"]._activate_lang("it_IT")
        self.pos_user.lang = "it_IT"
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self._start_pos_tour("PosMultiCurrencyCommaDecimalTour")

    def test_cash_rounding_proposes_the_foreign_due(self):
        rounding = self.env["account.cash.rounding"].create(
            {
                "name": "Nearest 0.05",
                "rounding": 0.05,
                "strategy": "add_invoice_line",
                "rounding_method": "HALF-UP",
                "profit_account_id": self.company_data["default_account_revenue"]
                .copy()
                .id,
                "loss_account_id": self.company_data["default_account_expense"]
                .copy()
                .id,
            }
        )
        self.main_pos_config.write(
            {
                "cash_rounding": True,
                "only_round_cash_method": True,
                "rounding_method": rounding.id,
            }
        )
        self.env["product.product"].create(
            {
                "name": "Rounding tender product",
                "available_in_pos": True,
                "list_price": 10.03,
                "taxes_id": [(5, 0, 0)],
                "type": "consu",
            }
        )
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self._start_pos_tour("PosMultiCurrencyCashRoundingTour")
