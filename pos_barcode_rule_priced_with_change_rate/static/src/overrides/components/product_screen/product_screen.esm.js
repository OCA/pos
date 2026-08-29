// Copyright 2024 Camptocamp SA (https://www.camptocamp.com).
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {patch} from "@web/core/utils/patch";
import {useBarcodeReader} from "@point_of_sale/app/hooks/barcode_reader_hook";

patch(ProductScreen.prototype, {
    setup() {
        super.setup(...arguments);
        useBarcodeReader({
            price_change_rate: this._onPriceChangeRateScan,
        });
    },

    /**
     * Handle barcode scan for "Priced Product with Change Rate" rule.
     *
     * Reads the barcode the same way as the standard `price` type,
     * then converts the encoded price according to the change rate
     * configured in the POS settings before adding the product
     * to the current order.
     *
     * @param {Object} code - Parsed barcode object from the nomenclature.
     */
    async _onPriceChangeRateScan(code) {
        const product = await this._getProductByBarcode(code);

        if (!product) {
            this.sound.play("scan-error");
            this.barcodeReader.showNotFoundNotification(code);
            return;
        }

        const rate = this.pos.config.change_rate_barcode;
        if (!rate || rate <= 0) {
            this.sound.play("scan-error");
            return;
        }

        this.sound.play("beep");
        const price = this.env.utils.roundCurrency(code.value / rate);

        await this.pos.addLineToCurrentOrder(
            {
                product_id: product,
                product_tmpl_id: product.product_tmpl_id,
                price_unit: price,
            },
            {code},
            product.needToConfigure()
        );
        this.numberBuffer.reset();
        this.showOptionalProductPopupIfNeeded(product);
    },
});
