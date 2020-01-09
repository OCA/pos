# © 2014-2016 Aurélien DUMAINE
# © 2015-2016 Akretion (Alexis de Lattre <alexis.delattre@akretion.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class PosConfig(models.Model):
    _inherit = "pos.config"

    _CUSTOMER_DISPLAY_FORMAT_SELECTION = [
        ("2_20", "2 Lines of 20 Characters"),
    ]

    iface_customer_display = fields.Boolean(
        string="LED Customer Display",
        help="Display data on the customer display"
    )

    customer_display_format = fields.Selection(
        selection=_CUSTOMER_DISPLAY_FORMAT_SELECTION,
        string="Customer Display Format",
        default="2_20", required=True)

    customer_display_line_length = fields.Integer(
        string="Line Length",
        compute="_compute_customer_display_line_length",
        store=True,
        help="Length of the LEDs lines of the customer display",
    )
    customer_display_msg_next_l1 = fields.Char(
        string="Next Customer (Line 1)",
        default=lambda x: x._default_customer_display_msg("next_l1"),
        help="First line of the message on the customer display which is "
        "displayed after starting POS and also after validation of an order",
    )
    customer_display_msg_next_l2 = fields.Char(
        string="Next Customer (Line 2)",
        default=lambda x: x._default_customer_display_msg("next_l2"),
        help="Second line of the message on the customer display which is "
        "displayed after starting POS and also after validation of an order",
    )
    customer_display_msg_closed_l1 = fields.Char(
        string="PoS Closed (Line 1)",
        default=lambda x: x._default_customer_display_msg("closed_l1"),
        help="First line of the message on the customer display which "
        "is displayed when POS is closed",
    )
    customer_display_msg_closed_l2 = fields.Char(
        string="PoS Closed (Line 2)",
        default=lambda x: x._default_customer_display_msg("closed_l1"),
        help="Second line of the message on the customer display which "
        "is displayed when POS is closed",
    )

    @api.model
    def _default_customer_display_msg(self, line):
        if line == "next_l1":
            return _("Point of Sale Open")
        elif line == "next_l2":
            return _("Welcome!")
        elif line == "closed_l1":
            return _("Point of Sale Closed")
        elif line == "closed_l2":
            return _("See you soon!")

    @api.depends("customer_display_format")
    def _compute_customer_display_line_length(self):
        for config in self:
            config.customer_display_line_length = int(
                config.customer_display_format.split("_")[1])

    @api.constrains(
        "iface_customer_display",
        "customer_display_format",
        "customer_display_msg_next_l1",
        "customer_display_msg_next_l2",
        "customer_display_msg_closed_l1",
        "customer_display_msg_closed_l2",
    )
    def _check_customer_display_length(self):
        for config in self.filtered(lambda x: x.customer_display_line_length):
            maxsize = config.customer_display_line_length
            fields_to_check = [
                x for x in self._fields.keys()
                if 'customer_display_msg_' in x
            ]
            for field_name in fields_to_check:
                value = getattr(config, field_name)
                if value and len(value) > maxsize:
                    raise ValidationError(
                        _(
                            "The message for customer display '%s' is too "
                            "long: it has %d chars whereas the maximum "
                            "is %d chars."
                        )
                        % (
                            self._fields[field_name].string,
                            len(value),
                            maxsize)
                    )
