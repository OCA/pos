# © 2016 Robin Keunen, Coop IT Easy SC
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    set_default_product_quantity = fields.Boolean(
        string="Sets default product quantity in POS", default=False
    )
