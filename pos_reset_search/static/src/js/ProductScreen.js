odoo.define("pos_reset_search.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const PosProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            async _clickProduct(event) {
                const ProductScreenChildren = this.__owl__.children;

                const ProductWidget = ProductScreenChildren.find(
                    (child) => child.el.className === "products-widget"
                );
                if (ProductWidget) {
                    const ProductWidgetChildren = ProductWidget.__owl__.children;

                    const ProductsWidgetControlPanel = ProductWidgetChildren.find(
                        (child) => child.el.className === "products-widget-control"
                    );
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
