# Copyright (C) 2015 Mathieu VATEL <mathieu@julius.fr>
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# Copyright (C) 2019 Druidoo <https://www.druidoo.io>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_automatic_cashdrawer = fields.Boolean(
        "Automatic Cashdrawer",
        help="An automatic cashdrawer is available",
    )

    iface_automatic_cashdrawer_ip_address = fields.Char(
        "Automatic Cashdrawer IP address",
    )

    iface_automatic_cashdrawer_tcp_port = fields.Char(
        "Automatic Cashdrawer TCP port",
        help=(
            "The port to connect to the Cashdrawer.\n"
            "WARNING: set a port bigger than 1024 to allow a non-root user to "
            "listen on it."
        ),
    )

    group_pos_automatic_cashlogy_config = fields.Many2one(
        comodel_name="res.groups",
        string="Point of Sale - Allow Cashlogy Config",
        compute="_compute_group_pos_automatic_cashlogy_config",
        help=(
            "This field is there to pass the id of the "
            '"PoS - Allow Cashlogy config" group to the POS.'
        ),
    )

    def _compute_group_pos_automatic_cashlogy_config(self):
        group = self.env.ref(
            "pos_automatic_cashdrawer_cashlogy.group_pos_automatic_cashlogy_config"
        )
        for record in self:
            record.group_pos_automatic_cashlogy_config = group
