odoo.define(
    "pos_favorite_product_categories.FavoriteCategoriesControlPanel",
    function (require) {
        "use strict";

        const ProductsWidgetControlPanel = require("point_of_sale.ProductsWidgetControlPanel");
        const Registries = require("point_of_sale.Registries");

        class FavoriteCategoriesControlPanel extends ProductsWidgetControlPanel {}

        FavoriteCategoriesControlPanel.template = "FavoriteCategoriesControlPanel";

        Registries.Component.add(FavoriteCategoriesControlPanel);

        return FavoriteCategoriesControlPanel;
    }
);
