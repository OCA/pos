/*  Copyright (C) 2023 KMEE (https://kmee.com.br)
    @author: Felipe Zago <felipe.zago@kmee.com.br>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_product_price_event.ProductsWidget", function (require) {
    "use strict";

    var ProductsWidget = require("point_of_sale.ProductsWidget");
    const Registries = require("point_of_sale.Registries");

    const ResourceProductEventWidget = (Product) =>
        class extends Product {
            get productsToDisplay() {
                return super.productsToDisplay.filter((product) => {
                    if (this.env.pos.productsToHide.includes(product.id)) {
                        return false;
                    }
                    return true;
                });
            }
        };

    Registries.Component.extend(ProductsWidget, ResourceProductEventWidget);

    return ResourceProductEventWidget;
});
