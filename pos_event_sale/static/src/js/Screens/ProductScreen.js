/*
    Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const PosEventSaleProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            async _clickProduct(event) {
                const product = event.detail;
                if (
                    this.env.pos.config.iface_event_sale &&
                    product.detailed_type === "event"
                ) {
                    return this.showPopup("EventSelectorPopup", {product});
                }
                return super._clickProduct(event);
            }
            _onClickPay() {
                // Update and check order events availability before
                // going to the payment screen. Prevent paying if error.
                if (this.currentOrder) {
                    this.currentOrder
                        .updateAndCheckEventAvailability()
                        .then(() => super._onClickPay(...arguments))
                        .catch((error) => {
                            this.showPopup("ErrorPopup", {
                                title: this.env._t("Event availability error"),
                                body: error.message || String(error),
                            });
                        });
                }
            }
        };

    Registries.Component.extend(ProductScreen, PosEventSaleProductScreen);
    return ProductScreen;
});
