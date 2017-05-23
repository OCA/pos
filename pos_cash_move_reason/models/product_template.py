# -*- coding: utf-8 -*-
# Copyright 2015-2017 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, fields


class product_template(models.Model):
    _inherit = 'product.template'

    income_pdt = fields.Boolean(string='Point of Sale Cash In',
                                help="Check if, this is a product you can "
                                     "use to put cash into a statement for "
                                     "the point of sale backend.")
    expense_pdt = fields.Boolean(string='Point of Sale Cash Out',
                                 help="Check if, this is a product you can use"
                                      " to take cash from a statement for the "
                                      "point of sale backend, example: money "
                                      "lost, transfert to bank, etc.")
