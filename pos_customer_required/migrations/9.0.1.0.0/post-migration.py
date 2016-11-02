# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openupgradelib import openupgrade


BOOLEAN_TO_SELECTION = [
    ('false', 'no'),
    ('true', 'order'),
]


@openupgrade.migrate()
def migrate(cr, installed_version):
    openupgrade.map_values(
        cr, openupgrade.get_legacy_name('require_customer'),
        'require_customer', BOOLEAN_TO_SELECTION, table='pos_config')
