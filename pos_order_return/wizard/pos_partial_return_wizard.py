# Copyright 2016-2018 Sylvain LE GAL (https://twitter.com/legalsylvain)
# Copyright 2018 Lambda IS DOOEL <https://www.lambda-is.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class PosPartialReturnWizard(models.TransientModel):
    _name = 'pos.partial.return.wizard'
    _description = 'Partial Return Wizard'

    order_id = fields.Many2one(
        comodel_name='pos.order',
        string='Order to Return',
    )
    line_ids = fields.One2many(
        comodel_name='pos.partial.return.wizard.line',
        inverse_name='wizard_id',
        string='Lines to Return',
    )

    def confirm(self):
        self.ensure_one()
        return self[0].order_id.partial_refund(self[0])

    @api.model
    def default_get(self, fields):
        order_obj = self.env['pos.order']
        res = super(PosPartialReturnWizard, self).default_get(fields)
        order = order_obj.browse(self.env.context.get('active_id', False))
        if order:
            line_ids = []
            for line in order.lines:
                line_ids.append((0, 0, {
                    'pos_order_line_id': line.id,
                    'initial_qty': line.qty,
                    'max_returnable_qty': line.max_returnable_qty([]),
                }))
            res.update({
                'order_id': order.id,
                'line_ids': line_ids})
        return res


class PosPartialReturnWizardLine(models.TransientModel):
    _name = 'pos.partial.return.wizard.line'
    _description = 'Partial Return Wizard Line'

    wizard_id = fields.Many2one(
        comodel_name='pos.partial.return.wizard',
        string='Wizard',
    )
    pos_order_line_id = fields.Many2one(
        comodel_name='pos.order.line',
        required=True,
        readonly=True,
        string='Line To Return',
    )
    initial_qty = fields.Float(
        string='Initial Quantity',
        readonly=True,
        help="Quantity of Product initially sold",
    )
    max_returnable_qty = fields.Float(
        string='Returnable Quantity',
        readonly=True,
        help="Compute maximum quantity that can be returned for this line, "
             "depending of the quantity of the line and other possible "
             "refunds.",
    )
    qty = fields.Float(
        string='Returned Quantity',
        default=0.0,
    )
