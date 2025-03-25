/** @odoo-module **/

import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {useBarcodeReader} from "@point_of_sale/app/barcode/barcode_reader_hook";
import {patch} from "@web/core/utils/patch";
import {ConfirmPopup} from "@point_of_sale/app/utils/confirm_popup/confirm_popup";
import {useService} from "@web/core/utils/hooks";
import {ErrorBarcodePopup} from "@point_of_sale/app/barcode/error_popup/barcode_error_popup";

patch(ProductScreen.prototype, {
    setup() {
        super.setup(...arguments);
        useBarcodeReader({
            price_change_rate: this._onPriceChangeRateScan,
        });
    },

    async _onPriceChangeRateScan(code) {
        // Read the barcode the same way than it is done for the standard `price` type (cf.
        // https://github.com/odoo/odoo/blob/17.0/addons/point_of_sale/static/src/app/screens/product_screen/product_screen.js#L257C1-L290C6),
        // and convert the price according to the change rate in POS settings before returning it.
        const product = await this._getProductByBarcode(code);
        if (!product) {
            return this.popup.add(ErrorBarcodePopup, {code: code.base_code});
        }
        const options = await product.getAddProductOptions(code);
        // Do not proceed on adding the product when no options is returned.
        // This is consistent with clickProduct.
        if (!options) {
            return;
        }

        Object.assign(options, {
            price: code.value / this.pos.config.change_rate_barcode,
            extras: {
                price_type: "manual",
            },
        });
        this.currentOrder.add_product(product, options);
        this.numberBuffer.reset();
    },
});
