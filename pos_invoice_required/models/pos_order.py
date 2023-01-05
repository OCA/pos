# Copyright (C) 2023-Today Level Prime Srl (<http://www.levelprime.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    require_invoice = fields.Selection(related="session_id.config_id.require_invoice",)
