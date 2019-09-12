# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.fr/>)
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: La Louve
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html

from odoo import fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    email_pos_receipt = fields.Boolean(
        string="E-receipt",
        default=False,
        help="If you tick this box and option 3 is selected for 'Receipt'\
         in point of sale settings, the user will only receive e-receipt ")
