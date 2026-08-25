# Copyright 2026 Open Source Integrators
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import api, fields, models
from odoo.exceptions import ValidationError


class PosConfig(models.Model):
    _inherit = "pos.config"

    use_pywebdriver = fields.Boolean(
        string="Use PyWebDriver",
        help="Connect receipt printer via a PyWebDriver proxy instead of IoT Box.",
        default=False,
    )
    pywebdriver_ip = fields.Char(
        string="PyWebDriver IP Address",
        help="URL of the PyWebDriver proxy, e.g. https://127.0.0.1:8069",
        default="https://127.0.0.1:8069",
    )

    @api.constrains("is_posbox", "use_pywebdriver")
    def _check_pywebdriver_iot_exclusive(self):
        for rec in self:
            if rec.is_posbox and rec.use_pywebdriver:
                raise ValidationError(
                    self.env._(
                        "IoT Box and PyWebDriver cannot both be enabled on "
                        "the same POS."
                    )
                )

    def write(self, vals):
        # Auto-clear the other flag when one is enabled for better UX.
        if vals.get("use_pywebdriver"):
            vals.setdefault("is_posbox", False)
        if vals.get("is_posbox"):
            vals.setdefault("use_pywebdriver", False)
        return super().write(vals)

    @api.model
    def _load_pos_data_read(self, records, config):
        """When use_pywebdriver is enabled, shim the standard proxy fields so
        the POS JS connects via PyWebDriver. is_posbox=True is required for the
        useProxy getter."""
        read_records = super()._load_pos_data_read(records, config)
        if read_records and config.use_pywebdriver and config.pywebdriver_ip:
            record = read_records[0]
            record["proxy_ip"] = config.pywebdriver_ip
            record["is_posbox"] = True  # required for useProxy getter
            record["iface_print_via_proxy"] = True
        return read_records
