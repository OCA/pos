# Copyright (C) 2015 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosPlace(models.Model):
    _name = "pos.place"
    _description = "Point of Sale Places"

    code = fields.Char(
        required=True, help="Short text, used on little screen, in responsive mode"
    )

    name = fields.Char(required=True, help="Complete name, used on normal screen")

    active = fields.Boolean(default=True)

    company_id = fields.Many2one(
        string="Company",
        comodel_name="res.company",
        default=lambda x: x._default_company_id(),
    )

    def _default_company_id(self):
        return self.env.company
