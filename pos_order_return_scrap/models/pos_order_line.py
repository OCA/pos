# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import fields, models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    is_scrap = fields.Boolean(string="Is Scrap?", copy=False)

    def _prepare_refund_data_partial_line(self, data, wizard_line):
        data = super()._prepare_refund_data_partial_line(data, wizard_line)
        data["is_scrap"] = wizard_line["is_scrap"]
        return data
