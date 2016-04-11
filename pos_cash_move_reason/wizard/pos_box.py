# -*- coding: utf-8 -*-
# © 2015 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import api, exceptions, fields, _
from openerp.addons.point_of_sale.wizard.pos_box import PosBox

from lxml import etree
import simplejson


class PosBoxCashMoveReason(PosBox):
    _register = False

    @api.onchange('product_id')
    def onchange_reason(self):
        for record in self:
            if record.product_id.id:
                record.name = record.product_id.name

    @api.model
    def fields_view_get(self, view_id=None, view_type='form',
                        toolbar=False, submenu=False):
        res = super(PosBoxCashMoveReason, self).fields_view_get(
            view_id=view_id, view_type=view_type, toolbar=toolbar,
            submenu=submenu)
        doc = etree.XML(res['arch'])
        if self.env.context.get('active_model', '') != 'pos.session':
            for node in doc.xpath("//field[@name='product_id']"):
                modifiers = {'invisible': True, 'required': False}
                node.set('invisible', '1')
                node.set('required', '0')
                node.set('modifiers', simplejson.dumps(modifiers))
        else:
            for node in doc.xpath("//field[@name='name']"):
                node.set('string', _('Description'))
        res['arch'] = etree.tostring(doc)
        return res


class PosBoxIn(PosBoxCashMoveReason):
    _inherit = 'cash.box.in'

    product_id = fields.Many2one(
        comodel_name='product.template', string='Reason',
        domain="[('income_pdt', '=', True)]")

    @api.model
    def _compute_values_for_statement_line(self, box, record):
        values = super(PosBoxIn, self)._compute_values_for_statement_line(
            box, record)
        if self.env.context.get('active_model', '') == 'pos.session':
            if box.product_id.id:
                product = box.product_id
                account_id = product.property_account_income.id or\
                    product.categ_id.property_account_income_categ.id
                if account_id:
                    values['account_id'] = account_id
                else:
                    raise exceptions.Warning(_("""You have to define an
                    income account on the related product"""))
        return values


class PosBoxOut(PosBoxCashMoveReason):
    _inherit = 'cash.box.out'

    product_id = fields.Many2one(
        comodel_name='product.template', string='Reason',
        domain="[('expense_pdt', '=', True)]")

    @api.model
    def _compute_values_for_statement_line(self, box, record):
        values = super(PosBoxOut, self)._compute_values_for_statement_line(
            box, record)
        if self.env.context.get('active_model', '') == 'pos.session':
            if box.product_id.id:
                product = box.product_id
                account_id = product.property_account_expense.id or\
                    product.categ_id.property_account_expense_categ.id
                if account_id:
                    values['account_id'] = account_id
                else:
                    raise exceptions.Warning(_("""You have to define an
                    expense account on the related product"""))
        return values
