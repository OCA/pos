# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import fields, models


class PosPartialReturnWizardLine(models.TransientModel):
    _name = 'pos.partial.return.wizard.line'

    wizard_id = fields.Many2one(
        comodel_name='pos.partial.return.wizard', string='Wizard')

    pos_order_line_id = fields.Many2one(
        comodel_name='pos.order.line', required=True, readonly=True,
        string='Line To Return')

    initial_qty = fields.Float(
        string='Initial Quantity', readonly=True,
        help="Quantity of Product initially sold")

    max_returnable_qty = fields.Float(
        string='Returnable Quantity', readonly=True,
        help="Compute maximum quantity that can be returned for this line,"
        " depending of the quantity of the line and other possible refunds.")

    qty = fields.Float(string='Returned Quantity', default=0.0)
