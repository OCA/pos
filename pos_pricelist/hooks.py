# -*- coding: utf-8 -*-
# Copyright 2018 Tecnativa - Jairo Llopis
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import api, SUPERUSER_ID


def post_init_hook(cr, registry):
    """Set default pricelists for existing POS configurations"""
    with api.Environment.manage():
        env = api.Environment(cr, SUPERUSER_ID, {})
        nopricelist = env["pos.config"].search([
            ("available_pricelist_ids", "=", False),
        ])
        for one in nopricelist:
            one.available_pricelist_ids = (one.pricelist_id or
                                           one._default_pricelist())
