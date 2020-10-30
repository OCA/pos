# Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class AccountJournal(models.Model):
    _inherit = 'account.journal'

    meal_voucher_type = fields.Selection(
        string="Meal Voucher Type",
        selection=[
            ("paper", "Paper"),
            ("dematerialized", "Dematerialized"),
            ("mixed", "Credit Card / Dematerialized"),
        ],
    )

    meal_voucher_mixed_text = fields.Char(
        string="Text for Mixed journal",
        help="Text that will be displayed in the point of sale"
        " if the journal is a mixed journal (Credit Card / "
        " Dematerialized) for the dematerialized button.")
