# Copyright 2018 GRAP - Sylvain LE GAL
# Copyright 2018 Tecnativa S.L. - David Vidal
# Copyright 2019 Coop IT Easy SCRLfs
#                   Pierrick Brun <pierrick.brun@akretion.com>
# Copyright 2019 Druidoo - Iván Todorovich
# Copyright 2023 Aures Tic - Jose Zambudio
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_return_done_order = fields.Boolean(
        string="Return Orders",
        default=True,
        help="Allows to return already done orders in the frontend",
    )
    iface_copy_done_order = fields.Boolean(
        string="Duplicate Orders",
        default=True,
        help="Allows to duplicate already done orders in the frontend",
    )
