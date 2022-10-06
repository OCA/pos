# Copyright 2022 KMEE - Gabriel Cardoso <gabriel.cardoso@kmee.com.br>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)

from odoo import fields, models


class ProcurementGroup(models.Model):
    _inherit = "procurement.group"

    pos_order_id = fields.Many2one("pos.order", "Pos Order")
