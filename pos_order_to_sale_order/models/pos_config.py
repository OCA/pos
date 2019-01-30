# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# @author: Raphael Reverdy (https://akretion.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'

    iface_allow_draft_order = fields.Boolean(
        string='Allow Quotations', default=True,
        help="Allow creation of quotations from the PoS.",
        old_name="iface_create_draft_sale_order")

    iface_allow_confirmed_order = fields.Boolean(
        string='Allow Sale Orders', default=True,
        help="Allow creation of sale orders from the PoS.",
        old_name="iface_create_confirmed_sale_order")

    iface_allow_delivered_order = fields.Boolean(
        string='Allow Delivered Sale Orders', default=True,
        help="Allow creation of delivered sale orders."
        " The according picking will be marked as delivered. Only invoices"
        " process will be possible.",
        old_name="iface_create_delivered_sale_order")

    iface_allow_order_payment = fields.Boolean(
        string='Allow Sale Order Payments', default=False,
        help="Accept payments for confirmed and delivered orders.")

    anonymous_partner_id = fields.Many2one(
        'res.partner',
        string='Anonymous Partner')
