odoo.define("pos_reset_search.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const PosProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            async _clickProduct(event) {
                const ProductScreenChildren = this.__owl__.children;
                var ProductWidget = null;
                for (const key in ProductScreenChildren) {
                    if (ProductScreenChildren[key].el.className === "products-widget") {
                        ProductWidget = ProductScreenChildren[key];
                    }
                }
                if (ProductWidget) {
                    const ProductWidgetChildren = ProductWidget.__owl__.children;

                    var ProductsWidgetControlPanel = null;
                    for (const key in ProductWidgetChildren) {
                        if (
                            ProductWidgetChildren[key].el.className ===
                            "products-widget-control"
                        ) {
                            ProductsWidgetControlPanel = ProductWidgetChildren[key];
                        }
                    }
                    if (ProductsWidgetControlPanel) {
                        ProductsWidgetControlPanel.clearSearch();
                    }
                }
                return super._clickProduct(event);
            }
        };

    Registries.Component.extend(ProductScreen, PosProductScreen);

    return ProductScreen;
});
