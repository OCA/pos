odoo.define("pos_product_available.ProductsWidget", function (require) {
    "use strict";

    var ProductsWidget = require("point_of_sale.ProductsWidget");
    const Registries = require("point_of_sale.Registries");

    const PosProductsAvailableWidget = (ProductsWidget) =>
        class extends ProductsWidget {

            get productsToDisplay() {
                let list = [];
                let products = [];
                const available_product = this.env.pos.config.available_product;
                console.log(available_product);
                const available_product_ids = this.env.pos.config.available_product_ids;
                if (this.searchWord !== "") {
                    if (available_product == true) {
                        products = this.env.pos.db.search_product_in_category(
                            this.selectedCategoryId,
                            this.searchWord
                        );
                        products.forEach(function (product) {
                            available_product_ids.forEach(function (product_available) {
                                if (product.product_tmpl_id == product_available) {
                                    list.push(product);
                                }
                            });
                        });
                    } else {
                        list = this.env.pos.db.search_product_in_category(
                            this.selectedCategoryId,
                            this.searchWord
                        );
                    }
                } else if (available_product == true) {
                    products = this.env.pos.db.get_product_by_category(
                        this.selectedCategoryId
                    );
                    products.forEach(function (product) {
                        available_product_ids.forEach(function (product_available) {
                            if (product.product_tmpl_id == product_available) {
                                list.push(product);
                            }
                        });
                    });
                } else {
                    list = this.env.pos.db.get_product_by_category(
                        this.selectedCategoryId
                    );
                }
                return list.sort(function (a, b) {
                    return a.display_name.localeCompare(b.display_name);
                });
            }
        };

    Registries.Component.extend(ProductsWidget, PosProductsAvailableWidget);

    return ProductsWidget;
});
