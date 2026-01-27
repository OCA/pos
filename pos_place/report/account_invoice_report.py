# Copyright (C) 2019 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class AccountInvoiceReport(models.Model):
    _inherit = "account.invoice.report"

    place_id = fields.Many2one(comodel_name="pos.place", string="Place", readonly=True)

    def _select(self):
        res = super()._select()
        res += ", move.place_id as place_id"
        return res
