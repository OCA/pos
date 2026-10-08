import {ProductProduct} from "@point_of_sale/app/models/product_product";
import {STORE_SYMBOL} from "@point_of_sale/app/models/related_models/utils";
import {patch} from "@web/core/utils/patch";

patch(ProductProduct.prototype, {
    setup(vals) {
        super.setup(vals);
        this._indexExtraBarcodes();
    },

    get searchString() {
        let str = super.searchString;
        for (const barcode of this._getExtraBarcodes()) {
            str += " " + barcode;
        }
        return str;
    },

    _getExtraBarcodes() {
        if (!this.barcodes_json) {
            return [];
        }
        try {
            return JSON.parse(this.barcodes_json).filter(Boolean);
        } catch {
            return [];
        }
    },

    // Register every barcode of the product in the "barcode" index so that
    // scanning a non-primary barcode resolves the product, instead of only the
    // main `barcode` field (default POS behaviour).
    _indexExtraBarcodes() {
        const barcodes = this._getExtraBarcodes();
        if (!barcodes.length) {
            return;
        }
        const store = this[STORE_SYMBOL];
        if (!store?.hasIndex("product.product", "barcode")) {
            return;
        }
        const barcodeMap = store.getRecordsMap("product.product", "barcode");
        for (const barcode of barcodes) {
            if (!barcodeMap.has(barcode)) {
                barcodeMap.set(barcode, this);
            }
        }
    },
});
