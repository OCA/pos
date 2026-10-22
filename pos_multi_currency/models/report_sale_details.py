# Copyright 2026 Cetmix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from datetime import timedelta

import pytz

from odoo import fields, models
from odoo.osv.expression import AND


class ReportSaleDetails(models.AbstractModel):
    _inherit = "report.point_of_sale.report_saledetails"

    def get_sale_details(
        self, date_start=False, date_stop=False, config_ids=False, session_ids=False
    ):
        """Build the sales details report, with foreign tenders in their own section.

        :param date_start: start datetime, or ``False``
        :param date_stop: end datetime, or ``False``
        :param config_ids: Point of Sale config ids, or ``False``
        :param session_ids: session ids, or ``False``
        :return: report values
        :rtype: dict
        """
        data = super().get_sale_details(date_start, date_stop, config_ids, session_ids)
        orders = self._sale_details_orders(
            date_start, date_stop, config_ids, session_ids
        )
        foreign_payments = orders.payment_ids.filtered("foreign_currency_id")
        if foreign_payments:
            self._exclude_foreign_payments(data, foreign_payments)
        data["foreign_currencies"] = self._foreign_sale_details(
            orders, foreign_payments
        )
        return data

    def _sale_details_orders(self, date_start, date_stop, config_ids, session_ids):
        """Orders that ``get_sale_details`` aggregates.

        The domain matches the one in the base method so a date range and a
        session list exclude the same orders.

        :return: ``pos.order`` recordset
        """
        domain = [("state", "in", ["paid", "invoiced", "done"])]
        if session_ids:
            domain = AND([domain, [("session_id", "in", session_ids)]])
        else:
            if date_start:
                date_start = fields.Datetime.from_string(date_start)
            else:
                user_tz = pytz.timezone(
                    self.env.context.get("tz") or self.env.user.tz or "UTC"
                )
                today = user_tz.localize(
                    fields.Datetime.from_string(fields.Date.context_today(self))
                )
                date_start = today.astimezone(pytz.timezone("UTC")).replace(tzinfo=None)
            if date_stop:
                date_stop = fields.Datetime.from_string(date_stop)
                if date_stop < date_start:
                    date_stop = date_start + timedelta(days=1, seconds=-1)
            else:
                date_stop = date_start + timedelta(days=1, seconds=-1)
            domain = AND(
                [
                    domain,
                    [
                        ("date_order", ">=", fields.Datetime.to_string(date_start)),
                        ("date_order", "<=", fields.Datetime.to_string(date_stop)),
                    ],
                ]
            )
            if config_ids:
                domain = AND([domain, [("config_id", "in", config_ids)]])
        return self.env["pos.order"].search(domain)

    def _exclude_foreign_payments(self, data, foreign_payments):
        """Keep Point of Sale currency figures free of foreign tenders.

        :param dict data: sale details
        :param foreign_payments: ``pos.payment`` recordset
        """
        pos_amount = {}
        for payment in foreign_payments:
            key = (payment.payment_method_id.id, payment.session_id.id)
            pos_amount[key] = pos_amount.get(key, 0.0) + payment.amount
        sessions = self.env["pos.session"].browse(
            {row["session"] for row in data["payments"] if row.get("session")}
        )
        for row in data["payments"]:
            session = sessions.filtered(
                lambda item, row=row: item.id == row.get("session")
            )[:1]
            if not session:
                continue
            if row.get("id"):
                removed = pos_amount.get((row["id"], session.id), 0.0)
                row["total"] = row.get("total", 0.0) - removed
                if "final_count" in row:
                    row["final_count"] -= removed
            if row.get("cash") or not row.get("id"):
                self._exclude_foreign_cash_moves(row, session)
            elif row.get("id"):
                self._exclude_foreign_bank_counted(row, session)
            if "money_counted" in row and "final_count" in row:
                row["money_difference"] = row["money_counted"] - row["final_count"]

    def _exclude_foreign_cash_moves(self, row, session):
        """Drop foreign cash in/out lines from a Point of Sale currency row.

        :param dict row: one payment row of the sale details
        :param session: ``pos.session`` record
        """
        foreign_keys = {
            (line.payment_ref, line.amount)
            for line in session.statement_line_ids
            if line.foreign_currency_id
        }
        row["cash_moves"] = [
            move
            for move in row.get("cash_moves") or []
            if (move.get("name"), move.get("amount")) not in foreign_keys
        ]

    def _exclude_foreign_bank_counted(self, row, session):
        """Count a bank method from its Point of Sale currency payments only.

        :param dict row: one payment row of the sale details
        :param session: ``pos.session`` record
        """
        payments = self.env["account.payment"].search(
            [
                ("pos_session_id", "=", session.id),
                ("pos_payment_method_id", "=", row["id"]),
                ("currency_id", "=", session.currency_id.id),
            ]
        )
        if "money_counted" not in row:
            return
        row["money_counted"] = sum(payments.mapped("amount"))

    def _foreign_sale_details(self, orders, foreign_payments):
        """Per-currency tender and drawer figures for the sales details report.

        :param orders: ``pos.order`` recordset
        :param foreign_payments: ``pos.payment`` recordset
        :return: list of currency sections
        :rtype: list
        """
        sections = []
        currencies = foreign_payments.foreign_currency_id
        sessions = orders.session_id
        for currency in currencies:
            tenders = foreign_payments.filtered(
                lambda payment, currency=currency: payment.foreign_currency_id
                == currency
            )
            pos_total = sum(tenders.mapped("amount"))
            tender_total = sum(tenders.mapped("amount_currency"))
            rate = tender_total / pos_total if pos_total else 0.0
            banks = []
            for method in tenders.payment_method_id.filtered(
                lambda method: method.type == "bank"
            ):
                method_tenders = tenders.filtered(
                    lambda payment, method=method: payment.payment_method_id == method
                )
                counted = 0.0
                for session in method_tenders.session_id:
                    row = session._get_currency_balance(method, currency)
                    counted += row.balance_end_real if row else 0.0
                expected = sum(method_tenders.mapped("amount_currency"))
                banks.append(
                    {
                        "name": method.name,
                        "expected": expected,
                        "counted": counted,
                        "difference": currency.round(counted - expected),
                    }
                )
            drawers = []
            for session in sessions:
                method = session._get_cash_control_method()
                if not method or currency not in session.config_id.foreign_currency_ids:
                    continue
                row = session._get_currency_balance(method, currency)
                expected = session._foreign_cash_expected(currency)
                counted = row.balance_end_real if row else 0.0
                drawers.append(
                    {
                        "session": session.name,
                        "expected": expected,
                        "counted": counted,
                        "difference": currency.round(counted - expected),
                    }
                )
            sections.append(
                {
                    "currency": currency.name,
                    "decimals": currency.decimal_places,
                    "tendered": currency.round(tender_total),
                    "pos_amount": orders[:1].currency_id.round(pos_total)
                    if orders
                    else pos_total,
                    "pos_currency": orders[:1].currency_id.name,
                    "rate": self.env["pos.session"]._format_foreign_rate(rate),
                    "banks": banks,
                    "drawers": drawers,
                }
            )
        return sections
