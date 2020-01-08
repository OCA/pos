# Copyright (C) 2020-Today: GRAP (<http://www.grap.coop/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, fields
from odoo.addons import decimal_precision as dp


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    tare = fields.Float(
        string="Tare",
        digits=dp.get_precision("Product Unit of Measure")
    )
