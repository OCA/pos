# © 2016 Robin Keunen, Coop IT Easy SC
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from odoo import fields, models


class UoMCategory(models.Model):
    _inherit = "uom.category"

    # TODO: Should this be hidden behind a boolean toggle?
    pos_default_qty = fields.Float(
        string="POS Default Quantity",
        required=True,
        default=1,
    )
