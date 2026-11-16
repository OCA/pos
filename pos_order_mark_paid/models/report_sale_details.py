# Copyright 2026 Cetmix OÜ
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from datetime import timedelta

import pytz

from odoo import api, fields, models
from odoo.osv.expression import AND


class ReportSaleDetails(models.AbstractModel):
    _inherit = "report.point_of_sale.report_saledetails"

    @api.model
    def get_sale_details(
        self, date_start=False, date_stop=False, config_ids=False, session_ids=False
    ):
        """Add the total write-off of the reported orders.

        :param str date_start: start of the period, default today 00:00:00
        :param str date_stop: end of the period, default date_start + 23:59:59
        :param list config_ids: ids of the Points of Sale to include
        :param list session_ids: ids of the sessions to include
        :return: sale details with ``write_off_total``
        :rtype: dict
        """
        res = super().get_sale_details(
            date_start=date_start,
            date_stop=date_stop,
            config_ids=config_ids,
            session_ids=session_ids,
        )
        orders = self.env["pos.order"].search(
            self._get_mark_paid_orders_domain(
                date_start, date_stop, config_ids, session_ids
            )
        )
        user_currency = self._get_mark_paid_currency(config_ids, session_ids)
        write_off_total = 0.0
        for order in orders.filtered("write_off_amount"):
            order_currency = order.session_id.currency_id
            if user_currency != order_currency:
                write_off_total += order_currency._convert(
                    order.write_off_amount,
                    user_currency,
                    order.company_id,
                    order.date_order or fields.Date.today(),
                )
            else:
                write_off_total += order.write_off_amount
        res["write_off_total"] = user_currency.round(write_off_total)
        return res

    @api.model
    def _get_mark_paid_orders_domain(
        self, date_start, date_stop, config_ids, session_ids
    ):
        """Return the domain of the orders that ``get_sale_details`` reports.

        Same domain as core, which has no hook to read it
        (point_of_sale/models/report_sale_details.py:27-56).

        :param str date_start: start of the period, default today 00:00:00
        :param str date_stop: end of the period, default date_start + 23:59:59
        :param list config_ids: ids of the Points of Sale to include
        :param list session_ids: ids of the sessions to include
        :return: domain on pos.order
        :rtype: list
        """
        domain = [("state", "in", ["paid", "invoiced", "done"])]
        if session_ids:
            return AND([domain, [("session_id", "in", session_ids)]])
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
        return domain

    @api.model
    def _get_mark_paid_currency(self, config_ids, session_ids):
        """Return the currency of the report, chosen as core does.

        Same rule as core (point_of_sale/models/report_sale_details.py:60-68):
        the currency of the Points of Sale when they all share one, else the
        company currency.

        :param list config_ids: ids of the Points of Sale to include
        :param list session_ids: ids of the sessions to include
        :return: currency of the report
        :rtype: res.currency
        """
        if config_ids:
            currencies = (
                self.env["pos.config"]
                .search([("id", "in", config_ids)])
                .mapped("currency_id")
            )
        else:
            currencies = (
                self.env["pos.session"]
                .search([("id", "in", session_ids or [])])
                .mapped("config_id.currency_id")
            )
        if len(currencies) == 1:
            return currencies
        return self.env.company.currency_id
