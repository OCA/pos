# © 2016 Robin Keunen, Coop IT Easy SCRL fs
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from odoo import fields, models


class UoMCategory(models.Model):
    _inherit = "uom.category"

    pos_default_qty = fields.Float(string="POS Default Quantity", default=1)
