# Copyright (C) 2015 Mathieu VATEL <mathieu@julius.fr>
# Copyright (C) 2016-Today: La Louve <http://www.lalouve.net/>
# Copyright (C) 2019 Druidoo <https://www.druidoo.io>

from odoo import models, fields


class AccountJournal(models.Model):
    _inherit = "account.journal"

    iface_automatic_cashdrawer = fields.Boolean(
        "Automatic cashdrawer",
        help="Check this if this journal is linked to an automatic cashdrawer",
    )
