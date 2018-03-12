# -*- coding: utf-8 -*-
# Copyright 2018 Tecnativa - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models


class PosOrder(models.Model):
    _inherit = 'pos.order'

    def _prepare_invoice(self):
        res = super(PosOrder, self)._prepare_invoice()
        res.update({
            'picking_ids': [(6, 0, self.picking_id.ids)],
        })
        return res

    def _action_create_invoice_line(self, line=False, invoice_id=False):
        invoice_line = super(
            PosOrder, self)._action_create_invoice_line(line, invoice_id)
        if not line:
            return invoice_line
        move = self.env['stock.move'].search([
            ('picking_id', '=', self.picking_id.id),
            ('name', '=', line.name)])
        if move:
            invoice_line.write({
                'move_line_ids': [(6, 0, move.ids)],
            })
        return invoice_line
