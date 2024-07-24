# Copyright 2024 Eugene Molotov (https://github.com/em230418)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    picking_creation_delayed = fields.Boolean(
        related="pos_config_id.picking_creation_delayed", readonly=False
    )
