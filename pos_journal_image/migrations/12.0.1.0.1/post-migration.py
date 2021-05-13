# Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openupgradelib import openupgrade
from openupgradelib import openupgrade_90


attachment_fields = {
    'account.journal': [
        ('pos_image', None),
    ],
}


@openupgrade.migrate(use_env=True)
def migrate(env, version):
    openupgrade_90.convert_binary_field_to_attachment(env, attachment_fields)
