import {formatFloat, roundPrecision} from "@web/core/utils/numbers";
import {onWillUnmount, useEffect, useState} from "@odoo/owl";
import {PosStore} from "@point_of_sale/app/services/pos_store";
import {ProductCard} from "@point_of_sale/app/components/product_card/product_card";
import {ProductInfoBanner} from "@point_of_sale/app/components/product_info_banner/product_info_banner";
import {debounce} from "@web/core/utils/timing";
import {patch} from "@web/core/utils/patch";
import {usePos} from "@point_of_sale/app/hooks/pos_hook";
import {useService} from "@web/core/utils/hooks";
import {useTrackedAsync} from "@point_of_sale/app/hooks/hooks";

patch(ProductCard, {
    props: {
        ...ProductCard.props,
        warehouse_info: {type: Array, optional: true},
    },
});

patch(ProductCard.prototype, {
    setup() {
        super.setup(...arguments);
        this.pos = usePos();
    },
    format_quantity(quantity) {
        const unit = this.props.product.uom_id;
        var formattedQuantity = `${quantity}`;
        if (unit) {
            if (unit.rounding) {
                const precision = this.pos.models["decimal.precision"].find(
                    (dp) => dp.name === "Product Unit of Measure"
                );
                const decimals = precision ? precision.digits : 2;
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
        return (
            this.props.product.warehouse_info ||
            this.props.product.raw.warehouse_info ||
            []
        );
    },
});

patch(PosStore.prototype, {
    async setup() {
        await super.setup(...arguments);
        this.data.connectWebSocket("PRODUCT_QUANTITY_UPDATE", (payload) => {
            this.updateProductQuantity(payload);
        });
    },
    updateProductQuantity(payload) {
        const messages = Array.isArray(payload) ? payload : [payload];
        for (const message of messages) {
            const productTmplId = message.product_tmpl_id;
            if (!productTmplId) {
                continue;
            }
            const product = this.models["product.template"].get(productTmplId);
            if (!product) {
                continue;
            }
            const warehouseInfo =
                product.warehouse_info || product.raw.warehouse_info || [];
            const warehouse = warehouseInfo.find((wh) => wh.id === message.id);
            if (warehouse) {
                product.warehouse_info = warehouseInfo.map((wh) =>
                    wh.id === message.id ? {...wh, quantity: message.quantity} : wh
                );
            } else {
                product.warehouse_info = [...warehouseInfo, message];
            }
        }
    },
});

patch(ProductInfoBanner.prototype, {
    setup() {
        this.pos = usePos();
        this.fetchStock = useTrackedAsync(
            (pt, p) => this.pos.getProductInfo(pt, 1, 0, p),
            {
                keepLast: true,
            }
        );
        this.ui = useService("ui");
        this.state = useState({
            other_warehouses: [],
            available_quantity: 0,
            free_qty: 0,
            uom: "",
        });

        const debouncedFetchStocks = debounce(async (product, productTemplate) => {
            let result = {};
            if (this.props.info) {
                result = this.props.info;
            } else {
                await this.fetchStock.call(productTemplate, product);
                if (this.fetchStock.status === "error") {
                    throw this.fetchStock.result;
                }
                result = this.fetchStock.result;
            }

            if (result) {
                const warehouses = result.productInfo.warehouses || [];
                const totalFreeQty = warehouses.reduce(
                    (partialSum, warehouse) => partialSum + (warehouse.free_qty || 0),
                    0
                );
                this.state.other_warehouses = warehouses;
                this.state.available_quantity = totalFreeQty;
                this.state.free_qty = totalFreeQty;
                this.state.uom = warehouses[0]?.uom;
            }
        }, 500);

        useEffect(
            () => {
                if (this.props.productTemplate) {
                    debouncedFetchStocks(
                        this.props.product,
                        this.props.productTemplate
                    );
                }
            },
            () => [this.props.product]
        );
        onWillUnmount(() => debouncedFetchStocks.cancel());
    },
});
