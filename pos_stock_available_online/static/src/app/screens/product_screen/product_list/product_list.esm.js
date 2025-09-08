/** @odoo-module **/

import {ProductsWidget} from "@point_of_sale/app/screens/product_screen/product_list/product_list";
import {patch} from "@web/core/utils/patch";
import {useEffect} from "@odoo/owl";

patch(ProductsWidget.prototype, {
    setup() {
        super.setup();
        const busService = this.env.services.bus_service;
        useEffect(() => {
            busService.addChannel(this._getChannelName());
            busService.addEventListener(
                "notification",
                this._onNotification.bind(this)
            );
            return () => {
                busService.deleteChannel(this._getChannelName());
                busService.removeEventListener(
                    "notification",
                    this._onNotification.bind(this)
                );
            };
        });
    },
    _getChannelName() {
        return JSON.stringify([
            "pos_stock_available_online",
            String(this.pos.config.id),
        ]);
    },
    _onNotification({detail: notifications}) {
        var payloads = [];
        for (const {payload, type} of notifications) {
            if (type === "pos.config/product_update") {
                payloads.push(payload);
            }
        }
        this._handleNotification(payloads);
    },
    async _handleNotification(payloads) {
        if (this.env.debug) {
            console.log("Payloads:", payloads);
        }
        const db = this.pos.db;
        const ProductIds = [];
        for (const payload of payloads) {
            for (const message of payload) {
                var product = db.get_product_by_id(message.product_id);
                if (product) {
                    // Update warehouse info of the product
                    var warehouse = product.warehouse_info.find(
                        (wh) => wh.id === message.id
                    );
                    if (warehouse) {
                        warehouse.quantity = message.quantity;
                    } else {
                        product.warehouse_info.push(message);
                    }
                } else {
                    ProductIds.push(message.id);
                }
            }
        }
        if (ProductIds.length) {
            await this.pos._addProducts([...new Set(ProductIds)], false);
        }
        // Re-render product list without category switching
        this.render(true);
    },
});
