from collections import defaultdict
from datetime import datetime

import pytz

from odoo import api, fields, models
from odoo.osv.expression import AND


class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.model
    def search_paid_orderline_ids(self, config_id, domain, limit, offset, orderby="id"):
        default_domain = [
            ("order_id.state", "!=", "draft"),
            ("order_id.state", "!=", "cancel"),
        ]
        real_domain = AND([domain, default_domain])
        orderlines = self.env["pos.order.line"].search(
            real_domain, limit=limit, offset=offset, order=orderby
        )
        orderLines_info = defaultdict(lambda: datetime.min)
        for orderline in orderlines:
            if orderLines_info[orderline.id] < orderline.write_date:
                orderLines_info[orderline.id] = orderline.write_date
        totalCount = self.env["pos.order.line"].search_count(real_domain)
        return {
            "orderLinesInfo": list(orderLines_info.items()),
            "totalCount": totalCount,
        }


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    date_order = fields.Datetime(related="order_id.date_order", store=True)

    def _export_for_ui(self, orderline):
        result = super()._export_for_ui(orderline)
        timezone = pytz.timezone(self._context.get("tz") or self.env.user.tz or "UTC")
        result["date_order"] = (str(orderline.date_order.astimezone(timezone)),)
        return result
