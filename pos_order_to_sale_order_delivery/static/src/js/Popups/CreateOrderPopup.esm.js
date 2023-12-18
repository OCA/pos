/** @odoo-module **/

import CreateOrderPopup from "point_of_sale.CreateOrderPopup";
import Registries from "point_of_sale.Registries";

const {useState} = owl;

const PosDeliveryCarrierCreateOrderPopup = (CreateOrderPopup) =>
    class extends CreateOrderPopup {
        // @override
        setup() {
            super.setup();
            this.state = useState({addDeliveryCarrier: false});
        }
        get currentOrder() {
            return this.env.pos.get_order();
        }
        onClickToShipping() {
            this.state.addDeliveryCarrier = !this.state.addDeliveryCarrier;
        }
        // @override
        async _actionCreateSaleOrder(order_state) {
            const addDeliveryCarrier = this.state.addDeliveryCarrier;
            if (addDeliveryCarrier) {
                const response = await this.rpc({
                    model: "delivery.carrier",
                    method: "get_pos_delivery_carriers",
                    args: [this.currentOrder.export_as_JSON(), this.env.pos.config.id],
                }).catch(function (error) {
                    throw error;
                });
                if (response) {
                    const {confirmed, payload} = await this._chooseDeliveryCarrier(
                        response
                    );
                    if (confirmed) {
                        await this.currentOrder.set_delivery_carrier(
                            this._prepareDeliveryCarrierData(payload)
                        );
                        if (this.currentOrder.get_delivery_carrier()) {
                            return await super._actionCreateSaleOrder(order_state);
                        }
                    }
                    return await this.cancel();
                }
                return await this.showPopup("ErrorPopup", {
                    title: this.env._t("Error"),
                    body: this.env._t("Not Found Shipping Methods."),
                });
            }
            return await super._actionCreateSaleOrder(order_state);
        }
        async _chooseDeliveryCarrier(choose_delivery_carriers) {
            return await this.showPopup("ChooseDeliveryCarrierPopup", {
                chooses: choose_delivery_carriers,
            });
        }
        _prepareDeliveryCarrierData(choose_delivery_carrier) {
            return {
                id: choose_delivery_carrier.carrier_id[0],
                delivery_price: choose_delivery_carrier.delivery_price,
                delivery_message: choose_delivery_carrier.delivery_message,
                delivery_type: choose_delivery_carrier.delivery_type,
            };
        }
    };

Registries.Component.extend(CreateOrderPopup, PosDeliveryCarrierCreateOrderPopup);
