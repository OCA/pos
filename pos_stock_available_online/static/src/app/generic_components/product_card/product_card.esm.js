/** @odoo-module **/

import {formatFloat, roundPrecision} from "@web/core/utils/numbers";
import {ProductCard} from "@point_of_sale/app/generic_components/product_card/product_card";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

patch(ProductCard.props, {
    ...ProductCard.props,
    warehouse_info: {type: Array, optional: true},
    uom_id: {type: Array},
});

patch(ProductCard.prototype, {
    setup() {
        super.setup();
        this.pos = useService("pos");
    },
    format_quantity(quantity) {
        const unit = this.pos.units_by_id[this.props.uom_id[0]];
        var formattedQuantity = `${quantity}`;
        if (unit) {
            if (unit.rounding) {
                var decimals = this.pos.dp["Product Unit of Measure"];
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
        return this.props.warehouse_info;
    },
});
