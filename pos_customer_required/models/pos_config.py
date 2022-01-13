# Copyright 2004 apertoso NV - Jos DE GRAEVE <Jos.DeGraeve@apertoso.be>
# Copyright 2016 La Louve - Sylvain LE GAL <https://twitter.com/legalsylvain>
# Copyright 2019 Druidoo - (https://www.druidoo.io)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    require_customer = fields.Selection(
        [
            ("no", "Optional"),
            ("payment", "Required before paying"),
            ("order", "Required before starting the order"),
        ],
        string="Require Customer",
        default="no",
        help="Require customer for orders in this point of sale:\n"
        "* 'Optional' (customer is optional);\n"
        "* 'Required before paying';\n"
        "* 'Required before starting the order';",
    )
