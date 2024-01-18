/** @odoo-module **/

import ProductItem from "point_of_sale.ProductItem";
import Registries from "point_of_sale.Registries";
import {format} from "web.field_utils";
import utils from "web.utils";

const StockProductItem = (OriginalProductItem) =>
    class extends OriginalProductItem {
        format_quantity(quantity) {
            const unit = this.env.pos.units_by_id[this.props.product.uom_id[0]];
            var formattedQuantity = `${quantity}`;
            if (unit) {
                if (unit.rounding) {
                    var decimals = this.env.pos.dp["Product Unit of Measure"];
                    formattedQuantity = format.float(quantity, {
                        digits: [69, decimals],
                    });
                } else {
                    formattedQuantity = utils.round_precision(quantity, 1).toFixed(0);
                }
            }
            return `${formattedQuantity}`;
        }
        get display_total_quantity() {
            return this.format_quantity(this.total_quantity);
        }
        get total_quantity() {
            return this.warehouses.reduce(
                (partialSum, warehouse) => partialSum + warehouse.quantity,
                0
            );
        }
        get warehouses() {
            return this.props.product.warehouse_info;
        }
    };

Registries.Component.extend(ProductItem, StockProductItem);
