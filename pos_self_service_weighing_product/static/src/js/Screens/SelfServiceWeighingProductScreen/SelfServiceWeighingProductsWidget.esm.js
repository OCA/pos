/** @odoo-module alias=pos_self_service_weighing_product.SelfServiceWeighingProductsWidget **/
// SPDX-FileCopyrightText: 2025 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import ProductsWidget from "point_of_sale.ProductsWidget";
import Registries from "point_of_sale.Registries";

class SelfServiceWeighingProductsWidget extends ProductsWidget {
    get productsToDisplay() {
        // Display only products that are weighable and that have a barcode
        // with the correct nomenclature to add a weight or a price.
        return super.productsToDisplay.filter((p) =>
            this.env.pos.filter_weight_price_barcode_product(p)
        );
    }
}

Registries.Component.add(SelfServiceWeighingProductsWidget);
export default SelfServiceWeighingProductsWidget;
