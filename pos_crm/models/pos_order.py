# Copyright 2022 KMEE - Gabriel Cardoso <gabriel.cardoso@kmee.com.br>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)

from odoo import fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    partner_vat = fields.Char(
        string="Partner VAT",
        default="",
    )
