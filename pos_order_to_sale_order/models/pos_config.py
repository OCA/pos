# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'

    iface_create_draft_sale_order = fields.Boolean(
        string='Create Draft Sale Orders', default=True,
        help="If checked, the cashier will have the possibility to create"
        " a draft Sale Order, based on the current draft PoS Order.")

    iface_create_confirmed_sale_order = fields.Boolean(
        string='Create Confirmed Sale Orders', default=True,
        help="If checked, the cashier will have the possibility to create"
        " a confirmed Sale Order, based on the current draft PoS Order.")

    iface_create_delivered_sale_order = fields.Boolean(
        string='Create Delivered Sale Orders', default=True,
        help="If checked, the cashier will have the possibility to create"
        " a confirmed sale Order, based on the current draft PoS Order.\n"
        " the according picking will be marked as delivered. Only invoices"
        " process will be possible.")
