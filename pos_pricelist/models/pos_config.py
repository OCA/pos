# -*- coding: utf-8 -*-
# Copyright 2018 Tecnativa - Jairo Llopis
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError
from oca.decorators import foreach  # pylint: disable=W7935
import logging

_logger = logging.getLogger(__name__)


class PosConfig(models.Model):
    _inherit = 'pos.config'

    # Redefine preexisting field
    pricelist_id = fields.Many2one(
        string="Default Pricelist",
        help="The pricelist used if no customer is selected or if the "
             "customer has no Sale Pricelist configured.",
    )
    # New fields
    available_pricelist_ids = fields.Many2many(
        'product.pricelist',
        string='Available Pricelists',
        default=lambda self: self._default_pricelist(),
        help="Make several pricelists available in the Point of Sale. "
             "You can also apply a pricelist to specific customers from "
             "their contact form (in Sales tab). To be valid, this pricelist "
             "must be listed here as an available pricelist. Otherwise the "
             "default pricelist will apply.",
    )
    use_pricelist = fields.Boolean(
        "Use pricelists",
        help="Set shop-specific prices, seasonal discounts, etc.",
    )
    group_sale_pricelist = fields.Boolean(
        "Use pricelists to adapt your price per customers",
        implied_group='product.group_sale_pricelist',
        help="Allows to manage different prices based on rules per "
             "category of customers. Example: 10% for retailers, promotion "
             "of 5 EUR on this product, etc.",
    )
    group_pricelist_item = fields.Boolean(
        "Show pricelists to customers",
        implied_group='product.group_pricelist_item',
    )

    @api.constrains('pricelist_id', 'available_pricelist_ids', 'journal_id',
                    'invoice_journal_id', 'journal_ids')
    @foreach()
    def _check_currencies(self):
        if self.pricelist_id not in self.available_pricelist_ids:
            raise ValidationError(_(
                "The default pricelist must be included in "
                "the available pricelists."))
        if self.available_pricelist_ids.filtered(
                lambda pricelist: pricelist.currency_id != self.currency_id):
            raise ValidationError(_(
                "All available pricelists must be in the same currency "
                "as the company or as the Sales Journal set on this "
                "point of sale if you use the Accounting application."))
        if (self.invoice_journal_id.currency_id and
                self.invoice_journal_id.currency_id != self.currency_id):
            raise ValidationError(_(
                "The invoice journal must be in the same currency as the "
                "Sales Journal or the company currency if that is not set."))
        if self.journal_ids.filtered(
                lambda journal: (journal.currency_id and
                                 journal.currency_id != self.currency_id)):
            raise ValidationError(_(
                "All payment methods must be in the same currency as the "
                "Sales Journal or the company currency if that is not set."))

    @api.onchange('use_pricelist')
    def _onchange_use_pricelist(self):
        """If the 'pricelist' box is unchecked, reset the pricelist_id

        This makes the posbox to stop using a pricelist.
        """
        if not self.use_pricelist:
            self.pricelist_id = self.available_pricelist_ids = \
                self._default_pricelist()
        else:
            self.update({
                'group_sale_pricelist': True,
                'group_pricelist_item': True,
            })

    @api.onchange('available_pricelist_ids')
    def _onchange_available_pricelist_ids(self):
        if self.pricelist_id not in self.available_pricelist_ids:
            self.pricelist_id = False

    @foreach()
    def _check_groups_implied(self):
        for field_name in (f for f in self.fields_get_keys()
                           if f.startswith('group_')):
            field = self._fields[field_name]
            if (field.type in {'boolean', 'selection'} and
                    hasattr(field, 'implied_group')):
                field_group_xmlids = getattr(
                    field, 'group', 'base.group_user').split(',')
                field_groups = self.env['res.groups'].concat(
                    *(self.env.ref(it) for it in field_group_xmlids))
                field_groups.write({
                    'implied_ids': [(4, self.env.ref(field.implied_group).id)],
                })

    @api.model
    def create(self, vals):
        result = super(PosConfig, self).create(vals)
        result.sudo()._check_groups_implied()
        return result

    def write(self, vals):
        result = super(PosConfig, self).write(vals)
        self.sudo()._check_groups_implied()
        return result
