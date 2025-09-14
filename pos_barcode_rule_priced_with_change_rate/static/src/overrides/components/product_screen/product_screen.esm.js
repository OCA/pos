import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {useBarcodeReader} from "@point_of_sale/app/barcode/barcode_reader_hook";
import {patch} from "@web/core/utils/patch";

patch(ProductScreen.prototype, {
    setup() {
        super.setup(...arguments);
        useBarcodeReader({
            price_change_rate: this._onPriceChangeRateScan,
        });
    },

    async _onPriceChangeRateScan(code) {
        // Read the barcode the same way than it is done for the standard `price` type
        // and convert the price according to the change rate in POS settings before returning it.
        const product = await this._getProductByBarcode(code);
        if (!product) {
            this.barcodeReader.showNotFoundNotification(code);
            return;
        }

        await this.pos.addLineToCurrentOrder(
            {
                product_id: product,
                price_unit: code.value / this.pos.config.change_rate_barcode,
            },
            {code},
            product.needToConfigure()
        );
        this.numberBuffer.reset();
    },
});
