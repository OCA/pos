# Copyright 2022 KMEE - Luis Felipe Mileo <mileo@kmee.com.br>
# Copyright 2022 KMEE - Gabriel Cardoso <gabriel.cardoso@kmee.com.br>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    pos_crm_question = fields.Selection(
        [
            ("no", "Don't ask"),
            ("payment", "Ask before paying"),
            ("order", "Ask before starting the order"),
        ],
        string="Ask Customer",
        default="no",
        help="Aks customer for orders in this point of sale:\n"
        "* 'Don't ask' (customer can be created and select as the normal workflow);\n"
        "* 'Ask before paying';\n"
        "* 'Ask before starting the order';",
    )

    pos_crm_auto_create_partner = fields.Boolean(
        string="Auto Create Partner",
        default=False,
        help="Automatic create Partner:\n" "* 'Name' will be the VAT number;\n",
    )
