# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Iván Todorovich <ivan.todorovich@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import SUPERUSER_ID, api


def post_init_hook(cr, __):
    """Set the Event Registration product available for POS"""
    env = api.Environment(cr, SUPERUSER_ID, {})
    product = env.ref("event_sale.product_product_event", raise_if_not_found=False)
    if product:
        product.available_in_pos = True
