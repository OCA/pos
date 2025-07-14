/** @odoo-module **/

import ProductScreen from "point_of_sale.ProductScreen";
import Registries from "point_of_sale.Registries";

export const DelegatedPartnerProductScreen = (OriginalProductScreen) =>
    class extends OriginalProductScreen {
        async _addProduct(product, options) {
            if (product.membership) {
                options.merge = false;
            }
            await super._addProduct(product, options);
        }
    };

Registries.Component.extend(ProductScreen, DelegatedPartnerProductScreen);
