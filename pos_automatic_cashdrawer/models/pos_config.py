# Copyright (C) 2015 Mathieu VATEL <mathieu@julius.fr>
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# Copyright (C) 2019 Druidoo <https://www.druidoo.io>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models, api


class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_automatic_cashdrawer = fields.Boolean(
        "Automatic Cashdrawer",
        help="An automatic cashdrawer is available on the Proxy",
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
        compute="_compute_group_pos_automatic_cashlogy_config",
        string="Point of Sale - Allow Cashlogy Config",
        help=(
            "This field is there to pass the id of the "
            '"PoS - Allow Cashlogy config" group to the POS.'
        ),
    )

    @api.multi
    def _compute_group_pos_automatic_cashlogy_config(self):
        group_id = self.env.ref(
            "pos_automatic_cashdrawer.group_pos_automatic_cashlogy_config"
        )
        for rec in self:
            rec.group_pos_automatic_cashlogy_config = group_id.id
