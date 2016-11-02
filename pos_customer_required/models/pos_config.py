# -*- coding: utf-8 -*-
# Copyright (C) 2004-Today Apertoso NV (<http://www.apertoso.be>)
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Jos DE GRAEVE (<Jos.DeGraeve@apertoso.be>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    _REQUIRE_CUSTOMER_KEYS = [
        ('no', 'Optional'),
        ('payment', 'Required before paying'),
        ('order', 'Required before starting the order'),
    ]

    require_customer = fields.Selection(
        selection=_REQUIRE_CUSTOMER_KEYS,
        string='Require Customer',
        help="Require customer for orders in this point of sale:\n"
        "* 'Optional' (customer is optional);\n"
        "* 'Required before paying';\n"
        "* 'Required before starting the order';")
