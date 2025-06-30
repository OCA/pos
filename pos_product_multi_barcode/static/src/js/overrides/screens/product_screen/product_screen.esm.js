import {patch} from "@web/core/utils/patch";
import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";

patch(ProductScreen.prototype, {
    loadProductFromDBDomain(searchProductWord) {
        const domain = super.loadProductFromDBDomain(searchProductWord);
        /* Add a condition to search by barcodes_json */
        if (searchProductWord) {
            domain.push(["barcode_ids.name", "in", [searchProductWord]]);
        }
        return domain;
    },
});
