# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosPartialReturnWizardLine(models.TransientModel):
    _inherit = "pos.partial.return.wizard.line"

    is_scrap = fields.Boolean(string="Is Scrap?")
