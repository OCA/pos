# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class ResourceProductEvent(models.Model):

    _name = "resource.product.event"
    _description = "Product events based on week days."

    active = fields.Boolean(string="Active", default=True)

    week_day = fields.Selection(
        selection=[
            ("1", "Monday"),
            ("2", "Tuesday"),
            ("3", "Wednesday"),
            ("4", "Thursday"),
            ("5", "Friday"),
            ("6", "Saturday"),
            ("0", "Sunday"),
        ],
        string="Day of Week",
        required=True,
        readonly=True,
    )

    price_event_ids = fields.One2many(
        comodel_name="resource.product.event.price",
        inverse_name="event_id",
        string="Events",
    )

    @api.depends("week_day")
    def name_get(self):
        return self.mapped(
            lambda r: (r.id, dict(self._fields["week_day"].selection).get(r.week_day))
        )

    @api.constrains("price_event_ids")
    def check_price_event_ids_duplicated_product(self):
        for rec in self:
            event_products = rec.price_event_ids.mapped("product_id")
            if len(event_products) != len(rec.price_event_ids):
                raise ValidationError(
                    _("You can't have the same product twice on the same event.")
                )


class ResourceProductEventPrice(models.Model):

    _name = "resource.product.event.price"
    _description = "Events to apply price changing on products."

    event_id = fields.Many2one(comodel_name="resource.product.event")

    event_name_id = fields.Many2one(
        comodel_name="resource.product.event.price.name",
        string="Event Name",
        required=True,
    )

    product_id = fields.Many2one(
        comodel_name="product.product",
        string="Product",
        domain=[("available_in_pos", "=", True)],
        required=True,
    )

    price = fields.Float(string="Product Price", required=True)

    product_availability = fields.Selection(
        selection=[
            ("always", "Always Available"),
            ("event_only", "This Event Only"),
        ],
        string="Product Availability",
        default="always",
        help="""
            Whether the product will be available in POS only when this event is active,
            or it will be always available.
        """,
    )

    @api.depends("event_name_id")
    def name_get(self):
        return self.mapped(lambda e: (e.id, e.event_name_id.name))

    @api.onchange("product_id")
    def onchange_product_id(self):
        product_domain = {"product_id": [("available_in_pos", "=", True)]}
        event_products = self.event_id.price_event_ids.mapped("product_id").ids
        if event_products:
            product_domain["product_id"].append(("id", "not in", event_products))

        return {"domain": product_domain}

    @api.onchange("product_availability")
    def onchange_product_availability(self):
        should_display_warning = (
            self.env["ir.config_parameter"]
            .sudo()
            .get_param("warning_product_availability")
        )

        if self.product_availability == "event_only" and should_display_warning:
            warning_message = {
                "title": _("Warning!"),
                "message": _(
                    'When you change the availability to "This Event Only", the '
                    "product will only be available for sale on the respective day."
                ),
            }
            return {"warning": warning_message}

    @api.constrains("price")
    def check_price(self):
        for _rec in self.filtered(lambda p: p.price <= 0):
            raise ValidationError(_("Price must be greater than 0."))


class ResourceProductEventPriceName(models.Model):

    _name = "resource.product.event.price.name"
    _description = "Event price name."

    name = fields.Char(string="Nome")

    _sql_constraints = [
        (
            "name_unique",
            "unique(name)",
            "A event price name must be unique.",
        )
    ]
