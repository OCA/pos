# Copyright (C) 2017-Today: La Louve (<http://www.lalouve.net/>)
# Copyright (C) 2019-Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class BarcodeRule(models.Model):
    _inherit = "barcode.rule"

    type = fields.Selection(
        selection_add=[("price_to_weight", "Priced Product (Computed Weight)")],
        ondelete={"price_to_weight": "cascade"},
    )
