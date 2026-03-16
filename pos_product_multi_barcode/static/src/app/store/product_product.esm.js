import {DataServiceOptions} from "@point_of_sale/app/models/data_service_options";
import {ProductProduct} from "@point_of_sale/app/models/product_product";
import {patch} from "@web/core/utils/patch";

patch(DataServiceOptions.prototype, {
    get databaseIndex() {
        const indexes = super.databaseIndex;
        if (!indexes["product.product"].includes("barcodes_json")) {
            indexes["product.product"].push("barcodes_json");
        }
        return indexes;
    },
});

patch(ProductProduct.prototype, {
    get searchString() {
        let str = super.searchString;
        if (this.barcodes_json) {
            const barcodes = JSON.parse(this.barcodes_json).join(" ");
            str += " " + barcodes;
        }
        return str;
    },

    setup(vals) {
        super.setup(vals);
        if (!this.barcodes_json) {
            return;
        }
        const barcodes = JSON.parse(this.barcodes_json);
        const modelIndex = this.model?.indexedRecords?.["product.product"]?.barcode;
        if (!modelIndex) {
            return;
        }
        barcodes.forEach((barcode) => {
            if (barcode in modelIndex) {
                return;
            }
            modelIndex[barcode] = this;
        });
    },
});
