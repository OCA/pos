# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright (C) 2004-Today Apertoso NV (<http://www.apertoso.be>)
#    Copyright (C) 2016-Today La Louve (<http://www.lalouve.net/>)
#
#    @author: Jos DE GRAEVE (<Jos.DeGraeve@apertoso.be>)
#    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
#
#    The licence is in the file __openerp__.py
#
##############################################################################

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
        string='Require customer',
        help="Require customer for orders in this point of sale:\n"
        "* 'no': customer is optional;"
        "* 'payment': customer is required before paying;"
        "* 'order': customer is required before starting the order;")
