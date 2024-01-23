from odoo import api, models


class DeliveryCarrier(models.Model):
    _inherit = "delivery.carrier"

    @api.model
    def get_pos_choose_delivery_fields(self):
        """
        Return fields names of `choose.delivery.fields` model to read for PoS
        """
        return [
            "carrier_id",
            "delivery_type",
            "delivery_price",
            "display_price",
            "currency_id",
            "delivery_message",
        ]

    @api.model
    def get_pos_delivery_carriers(self, order_data, config_id):
        """
        Return available delivery carrier data for PoS
        """
        config = self.env["pos.config"].browse(config_id)
        delivery_carriers = config.iface_sale_order_delivery_carrier_ids
        if not config.iface_sale_order_allow_delivery or not delivery_carriers:
            return False

        sale_order_obj = self.env["sale.order"]
        order_vals = sale_order_obj._prepare_from_pos(order_data)
        sale_order = sale_order_obj.new(order_vals)

        available_carriers = delivery_carriers.available_carriers(
            sale_order.partner_shipping_id
        )
        if not available_carriers:
            return False

        choose_delivery_carriers = choose_delivery_carrier_obj = self.env[
            "choose.delivery.carrier"
        ]
        sale_order_id = sale_order.id
        for carrier in available_carriers:
            choose = choose_delivery_carrier_obj.new(
                {
                    "order_id": sale_order_id,
                    "carrier_id": carrier.id,
                }
            )
            choose._get_shipment_rate()
            choose_delivery_carriers |= choose

        base_model_obj = models.BaseModel
        fields_to_read = self.get_pos_choose_delivery_fields()

        choose_delivery_carrier_list = [
            {
                field_name: (
                    [
                        getattr(choose, field_name).id,
                        getattr(choose, field_name).display_name,
                    ]
                    if isinstance(getattr(choose, field_name), base_model_obj)
                    else getattr(choose, field_name)
                )
                for field_name in fields_to_read
            }
            for choose in choose_delivery_carriers
        ]

        return choose_delivery_carrier_list
