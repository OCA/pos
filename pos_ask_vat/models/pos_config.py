# Copyright 2022 KMEE - Luis Felipe Mileo <mileo@kmee.com.br>
# Copyright 2022 KMEE - Gabriel Cardoso <gabriel.cardoso@kmee.com.br>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosConfig(models.Model):

    _inherit = "pos.config"

    iface_pos_ask_vat = fields.Boolean(
        string="POS ASK VAT Module",
        default=False,
    )

    pos_ask_vat_question = fields.Selection(
        [
            ("no", "Don't ask"),
            ("payment", "Ask before paying"),
        ],
        string="Ask Customer",
        default="no",
        help="Ask customer for orders in this point of sale:\n"
        "* 'Don't ask' (customer can be created and select as the normal workflow);\n"
        "* 'Ask before paying';\n",
    )

    pos_ask_vat_auto_create_partner = fields.Boolean(
        string="Auto Create Partner",
        default=False,
        help="Automatic create Partner:\n" "* 'Name' will be the VAT number;\n",
    )

    @api.onchange("iface_pos_ask_vat")
    def _onchange_iface_pos_ask_vat(self):
        if not self.iface_pos_ask_vat:
            self.pos_ask_vat_question = "no"
            self.pos_ask_vat_auto_create_partner = False

    @api.onchange("pos_ask_vat_question")
    def _onchange_pos_ask_vat_question(self):
        if self.pos_ask_vat_question == "no":
            self.pos_ask_vat_auto_create_partner = False
