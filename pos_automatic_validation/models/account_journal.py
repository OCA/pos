# Copyright (C) 2015 Mathieu VATEL <mathieu@julius.fr>
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: Mathieu VATEL <mathieu@julius.fr>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, fields


class AccountJournal(models.Model):
    _inherit = 'account.journal'

    iface_automatic_validation = fields.Boolean(
        'Automatic Validation',
        help="Check this if this journal validate the sale "
        "automatically if payment is completed.")
