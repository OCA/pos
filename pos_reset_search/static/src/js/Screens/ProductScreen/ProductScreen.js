odoo.define("pos_reset_search.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const PosProductScreen = (PaymentScreen_) =>
        class extends PaymentScreen_ {
            async _clickProduct(event) {
                const ProductScreenChildren = this.__owl__.children;
                var ProductWidget = null;
                for (const key in ProductScreenChildren) {
                    if (
                        ProductScreenChildren[key].bdom.el.className ===
                        "products-widget"
                    ) {
                        ProductWidget = ProductScreenChildren[key];
                    }
                }
                if (ProductWidget) {
                    const ProductWidgetChildren = ProductWidget.children;

                    var ProductsWidgetControlPanel = null;
                    for (const key in ProductWidgetChildren) {
                        if (
                            ProductWidgetChildren[key].bdom.el.className ===
                            "products-widget-control"
                        ) {
                            ProductsWidgetControlPanel = ProductWidgetChildren[key];
                        }
                    }
                    if (
                        ProductsWidgetControlPanel &&
                        ProductsWidgetControlPanel.component.searchWordInput.el
                    ) {
                        ProductsWidgetControlPanel.component._clearSearch();
                    }
                }
                return super._clickProduct(event);
            }
        };

    Registries.Component.extend(ProductScreen, PosProductScreen);

    return PosProductScreen;
});
