odoo.define("pos_favorite_product_categories.ProductsWidget", function (require) {
    "use strict";

    const ProductsWidget = require("point_of_sale.ProductsWidget");
    const Registries = require("point_of_sale.Registries");

    const FavoriteCategoriesProductWidget = (ProductsWidget) =>
        class extends ProductsWidget {
            get favoriteCategories() {
                const all_categories = Object.values(this.env.pos.db.category_by_id);
                return all_categories.filter((category) => {
                    return category.favorite === "1";
                });
            }

            get subcategories() {
                const res = super.subcategories;
                return res.filter((category) => {
                    if (!category.favorite) return true;

                    if (category.favorite) {
                        if (category.only_favorite_bar) {
                            return false;
                        }
                        return true;
                    }
                });
            }
        };

    Registries.Component.extend(ProductsWidget, FavoriteCategoriesProductWidget);

    return FavoriteCategoriesProductWidget;
});
