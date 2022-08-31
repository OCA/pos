# Copyright 2022 KMEE
# License LGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    open_replay_active = fields.Boolean()
    open_replay_ingest_point = fields.Char(string="URL")
    open_replay_project_key = fields.Char(string="Key")
    open_replay_default_input_mode = fields.Selection(
        [
            ("0", "Record all inputs"),
            ("1", "Ignore all inputs"),
            ("1", "Obscure all inputs"),
        ]
    )
    open_replay_obscure_text_numbers = fields.Boolean(
        string="Do not record any numeric text"
    )
    open_replay_obscure_text_emails = fields.Boolean(
        string="Do not record email addresses"
    )
