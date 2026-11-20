from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    receipt_options = fields.Selection(
        [
            ("1", "Do not send receipt via email"),
            ("2", "Email receipt and print it"),
            (
                "3",
                "Email receipt and print it unless configured on user that \
                   he only receives electronically",
            ),
            ("4", "Email receipt"),
        ],
        string="Receipt",
    )
