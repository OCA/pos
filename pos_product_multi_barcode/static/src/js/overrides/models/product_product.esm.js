import {patch} from "@web/core/utils/patch";
import {ProductProduct} from "@point_of_sale/app/models/product_product";

patch(ProductProduct.prototype, {
    get searchString() {
        let searchString = super.searchString;
        const barcodes = this.barcodes_json
            ? JSON.parse(this.barcodes_json).join(" ")
            : null;
        if (barcodes) {
            searchString += barcodes;
        }
        return searchString;
    },
});
