# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models
from odoo.addons import decimal_precision as dp


class PosPartialReturnWizardLine(models.TransientModel):
    _inherit = 'pos.partial.return.wizard.line'

    is_scrap = fields.Boolean(
        string="Is Scrap?"
    )
    initial_qty = fields.Float(
        digits=dp.get_precision('Product Unit of Measure')
    )
    max_returnable_qty = fields.Float(
        digits=dp.get_precision('Product Unit of Measure')
    )
    qty = fields.Float(
        digits=dp.get_precision('Product Unit of Measure')
    )
