# Copyright 2022 KMEE
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).


from odoo import _, api, fields, models
from odoo.exceptions import UserError


class PosConfig(models.Model):

    _inherit = "pos.config"

    iface_screen_lock = fields.Boolean(
        string="Automatic Lock Screen",
        help="Allows the system to be locked after a certain time.",
    )

    screen_lock_time = fields.Integer(
        string="Maximum system downtime (minutes)",
        help="Amount of time, in minutes, of system inactivity before the screen "
        + "lock can occur.",
        default=10,
    )

    iface_screen_lock_warning = fields.Boolean(
        string="Inactivity warning message",
        help="Allows a system inactivityu warning message to appear after a period "
        + "of time.",
    )

    warning_screen_lock_time = fields.Integer(
        string="Time to inactivity warning message (minutes)",
        help="Sets a minimum system inactivity time for a warning message to "
        + "appear before the screen is locked.",
    )

    @api.constrains("warning_screen_lock_time", "screen_lock_time")
    def _check_screen_lock_time(self):
        for record in self.filtered(lambda p: p.iface_screen_lock):
            if record.screen_lock_time <= 0 or (
                record.iface_screen_lock_warning
                and record.warning_screen_lock_time <= 0
            ):
                raise UserError(_("The screen/warning lock time cant be less than 1."))

            if (
                record.iface_screen_lock_warning
                and record.warning_screen_lock_time >= record.screen_lock_time
            ):
                raise UserError(
                    _(
                        "The system inactivity alert message time must "
                        + "be less than the inactivity lock time."
                    )
                )
