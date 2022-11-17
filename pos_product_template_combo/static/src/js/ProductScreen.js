odoo.define("pos_product_template_combo.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const PTCProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            async _clickProduct(event) {
                const product = event.detail;

                if (product.is_combo) {
                    const result = await this.showPopup("SelectComboPopup", {
                        product: product,
                    });

                    if (result.confirmed) {
                        const aborted = await this._complete_missing_products_from_template(
                            result
                        );
                        if (aborted) {
                            return;
                        }
                        this._add_combo_products_to_order(result);
                    }
                    return;
                }
                return super._clickProduct(event);
            }

            /**
             * For options associated with products.templates with more than one product,
             * "SelectVariantPopup" is used to ask the user which product to add
             * @param {Object} result Return of the combo popup with the chosen options
             * @returns {Boolean} True if the user aborted the product choice, otherwise false
             */
            async _complete_missing_products_from_template(result) {
                let aborted = false;
                const products = result.payload;
                for (let i = 0; i < products.length; i++) {
                    if (!products[i].product) {
                        // Ask the user for the variant
                        const result = await this.showPopup("SelectVariantPopup", {
                            template_id: products[i].template_id,
                            combo_category: i,
                        });

                        // Aborts the entire combo flow if the user does not select the variant
                        if (result.confirmed) {
                            products[i].product = result.payload;

                            if (products[i].price === 0) {
                                products[i].price = result.payload.lst_price;
                            }
                        } else {
                            aborted = true;
                            break;
                        }
                    }
                }

                return aborted;
            }

            _add_combo_products_to_order(result) {
                result.payload.forEach(async (product_to_add) => {
                    const options = {
                        price: product_to_add.price,
                        quantity: product_to_add.quantity,
                        merge: false,
                    };
                    if (product_to_add.product) {
                        const order = this.env.pos.get_order();
                        order.add_product(product_to_add.product, options);
                    }
                });
            }
        };

    Registries.Component.extend(ProductScreen, PTCProductScreen);

    return {
        PPTProductScreen: PTCProductScreen,
    };
});
