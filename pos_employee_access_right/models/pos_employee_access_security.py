# Copyright 2022 KMEE
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import fields, models

PERMISSIONS_OPTIONS = [
    ("allowed", "Allowed"),
    ("not_allowed", "Not Allowed"),
    ("partially_allowed", "Partially Allowed"),
]


class PosEmployeeAccessSecurity(models.Model):
    _name = "pos.employee.access.security"

    pos_component_id = fields.Many2one(
        string="Component",
        comodel_name="pos.component.security",
        required=True,
    )
    pos_event_type = fields.Char(
        string="Event Type",
    )
    pos_payload = fields.Char(
        string="Payload",
    )
    job_position_id = fields.Many2one(
        string="Job Position",
        comodel_name="hr.job",
        required=True,
        company_dependent=True,
    )
    permission = fields.Selection(
        string="Permission",
        selection=PERMISSIONS_OPTIONS,
        Required=True,
        default="not_allowed",
    )
