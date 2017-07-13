# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'

    CREATE_SALE_ORDER_ACTION_SELECTION = [
        ('draft_order', 'Draft Sale Order'),
        ('confirmed_order', 'Confirmed Sale Order'),
        ('delivered_picking', 'Delivered Picking'),
    ]

    iface_create_sale_order = fields.Boolean(
        string='Create Sale Orders', default=True,
        help="If checked, the cashier will have the possibility to create"
        " a Sale Order, based on the current draft PoS Order.\n"
        " If so, the current PoS Order will be discarded.")

    iface_create_sale_order_action = fields.Selection(
        string='Sale Order Actions', default='delivered_picking',
        required=True, selection=CREATE_SALE_ORDER_ACTION_SELECTION,
        help="Choose wich operation will be done after creating a Sale Order"
        " from a PoS Order:\n"
        " * 'Draft Sale Order' : The sale order will be created in a draft"
        "  mode, and could be changed later;\n"
        " * 'Confirmed Sale Order': The Sale order will be created and"
        " confirmed\n"
        " * 'Delivered Picking': The sale Order will be created, and confirmed"
        ". The related picking will be marked as delivered. Only invoices"
        " process will be possible")
