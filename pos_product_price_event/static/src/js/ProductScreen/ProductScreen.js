/*  Copyright (C) 2023 KMEE (https://kmee.com.br)
    @author: Felipe Zago <felipe.zago@kmee.com.br>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_product_price_event.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const ResourceProductEventScreen = (Product) =>
        class extends Product {
            async _clickProduct(event) {
                await super._clickProduct(event);

                const product = event.detail;
                const selectedOrderLine = this.currentOrder.get_selected_orderline();
                if (product.product_event_id) {
                    selectedOrderLine.product_event_id = product.product_event_id;
                }
            }
        };

    Registries.Component.extend(ProductScreen, ResourceProductEventScreen);
    return ProductScreen;
});
