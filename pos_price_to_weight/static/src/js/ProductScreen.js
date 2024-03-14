/*
    Copyright (C) 2024 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/
odoo.define("pos_price_to_weight.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");
    const {useBarcodeReader} = require("point_of_sale.custom_hooks");
    const NumberBuffer = require("point_of_sale.NumberBuffer");

    const PosPriceToWeightProductScreen = (OriginalProductScreen) =>
        class extends OriginalProductScreen {
            setup() {
                super.setup();
                useBarcodeReader({
                    price_to_weight: this._barcodeProductAction,
                });
            }
            async _barcodeProductAction(code) {
                if (code.type !== "price_to_weight") {
                    return await super._barcodeProductAction(...arguments);
                }

                // <BEGIN> copy of the original function '_barcodeProductAction'
                const product = await this._getProductByBarcode(code);
                if (!product) {
                    return;
                }
                const options = await this._getAddProductOptions(product, code);
                // Do not proceed on adding the product when no options is returned.
                // This is consistent with _clickProduct.
                if (!options) return;
                // </END> copy of the original function '_barcodeProductAction'

                // update the options depending on the type of the scanned code

                var quantity = 0;
                var barcode_price = parseFloat(code.value, 10) || 0;
                var product_price = product.lst_price;

                if (product_price !== 0) {
                    quantity = barcode_price / product_price;
                }
                Object.assign(options, {
                    quantity: quantity,
                    merge: false,
                });
                this.currentOrder.add_product(product, options);
                NumberBuffer.reset();
            }
        };

    Registries.Component.extend(ProductScreen, PosPriceToWeightProductScreen);

    return ProductScreen;
});
