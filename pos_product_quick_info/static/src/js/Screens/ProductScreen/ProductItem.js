odoo.define("pos_product_quick_info.ProductItem", function (require) {
    "use strict";

    const ProductItem = require("point_of_sale.ProductItem");
    const Registries = require("point_of_sale.Registries");

    const QuickInfoProductItem = (ProductItem) =>
        class QuickInfoProductItem extends ProductItem {
            async onProductInfoClick(event) {
                event.stopPropagation();
                return await super.onProductInfoClick(...arguments);
            }
        };

    Registries.Component.extend(ProductItem, QuickInfoProductItem);

    return QuickInfoProductItem;
});
