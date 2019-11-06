# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).


from openerp import models, fields


class PosConfig(models.Model):

    _inherit = 'pos.config'

    payment_amount_readonly = fields.Boolean(
        help="Payment lines amount would be readonly. This should be used"
             "with the 'Prefill Cash Payment' option")
