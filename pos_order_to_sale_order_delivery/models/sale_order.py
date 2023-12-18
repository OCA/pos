from odoo import api, models


class SaleOrder(models.Model):
    _inherit = "sale.order"

    @api.model
    def create_order_from_pos(self, order_data, action):
        if order_data.get("delivery_carrier"):
            return super(
                SaleOrder,
                self.with_context(
                    with_pos_delivery_carrier=order_data["delivery_carrier"]
                ),
            ).create_order_from_pos(order_data, action)
        return super().create_order_from_pos(order_data, action)

    @api.model_create_multi
    def create(self, vals_list):
        orders = super().create(vals_list)
        carrier_data = self.env.context.get("with_pos_delivery_carrier")
        if carrier_data:
            orders.set_pos_delivery_carrier(carrier_data)
        return orders

    def set_pos_delivery_carrier(self, carrier_data):
        """
        Set delivery carrier for current Sale Order from POS data
        """
        self.ensure_one()
        delivery_carrier = self.env["delivery.carrier"].browse(carrier_data["id"])
        self.set_delivery_line(delivery_carrier, carrier_data["delivery_price"])
        self.write(
            {
                "recompute_delivery_price": False,
                "delivery_message": carrier_data["delivery_message"],
            }
        )
        self.invalidate_model()
