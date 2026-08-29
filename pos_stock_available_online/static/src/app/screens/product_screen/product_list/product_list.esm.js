import {ProductCard} from "@point_of_sale/app/generic_components/product_card/product_card";
import {formatFloat, roundPrecision} from "@web/core/utils/numbers";
import {patch} from "@web/core/utils/patch";
import {useEffect} from "@odoo/owl";
import {usePos} from "@point_of_sale/app/store/pos_hook";

patch(ProductCard, {
    props: {
        ...ProductCard.props,
        warehouse_info: {type: Array, optional: true},
        uom_id: {type: Number, optional: true},
    },
});

patch(ProductCard.prototype, {
    setup() {
        super.setup(...arguments);
        this.pos = usePos();
        const busService = this.env.services.bus_service;
        useEffect(() => {
            busService.subscribe("pos.config/product_update", (notifications) => {
                this._onNotification(notifications);
            });
        });
    },
    format_quantity(quantity) {
        const unit = this.this.props.product.uom_id;
        var formattedQuantity = `${quantity}`;
        if (unit) {
            if (unit.rounding) {
                const decimals = this.pos.data.models["decimal.precision"].find(
                    (dp) => dp.name === "Product Unit of Measure"
                ).digits;
                formattedQuantity = formatFloat(quantity, {
                    digits: [69, decimals],
                });
            } else {
                formattedQuantity = roundPrecision(quantity, 1).toFixed(0);
            }
        }
        return `${formattedQuantity}`;
    },
    get display_total_quantity() {
        return this.format_quantity(this.total_quantity);
    },
    get total_quantity() {
        return this.warehouses.reduce(
            (partialSum, warehouse) => partialSum + warehouse.quantity,
            0
        );
    },
    get displayProductQuantity() {
        return this.pos.config.display_product_quantity;
    },
    get minimumProductQuantityAlert() {
        return this.pos.config.minimum_product_quantity_alert;
    },
    get warehouses() {
        return this.props.product.baseData[this.props.product.id].warehouse_info || [];
    },
    _getChannelName() {
        return JSON.stringify([
            "pos_stock_available_online",
            String(this.pos.config.id),
        ]);
    },
    _onNotification(notifications) {
        const payloads = [];
        for (const notification of notifications) {
            if (notification[1] === "pos.config/product_update") {
                payloads.push(notification[2]);
            }
        }
        this._handleNotification(payloads);
    },
    async _handleNotification(payloads) {
        const ProductIds = [];
        for (const payload of payloads) {
            for (const message of payload) {
                const productId = message.product_id;
                if (!productId) {
                    continue;
                }
                const product = this.pos.models["product.product"].get(productId);
                if (product) {
                    if (!product.warehouse_info) {
                        product.warehouse_info = product.raw?.warehouse_info
                            ? [...product.raw.warehouse_info]
                            : [];
                    }
                    const warehouse = product.warehouse_info.find(
                        (wh) => wh.id === message.id
                    );
                    if (warehouse) {
                        warehouse.quantity = message.quantity;
                    } else {
                        product.warehouse_info.push(message);
                    }
                } else {
                    ProductIds.push(productId);
                }
            }
        }
        if (ProductIds.length) {
            const uniqueProductIds = [...new Set(ProductIds)];
            await this.pos.data.read("product.product", uniqueProductIds);
            await this.pos.processProductAttributes();
        }
        this.render(true);
    },
});
