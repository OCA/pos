/** @odoo-module **/

import ProductsWidget from "point_of_sale.ProductsWidget";
import Registries from "point_of_sale.Registries";

const SequenceProductsWidget = (ProductsWidget) =>
    class SequenceProductsWidget extends ProductsWidget {
        get productsToDisplay() {
            return super.productsToDisplay.sort(
                (a, b) => a.pos_sequence - b.pos_sequence
            );
        }
    };

Registries.Component.extend(ProductsWidget, SequenceProductsWidget);
