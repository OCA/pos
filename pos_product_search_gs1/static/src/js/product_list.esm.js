/** @odoo-module **/

import {ProductsWidget} from "@point_of_sale/app/screens/product_screen/product_list/product_list";
import {patch} from "@web/core/utils/patch";

patch(ProductsWidget.prototype, {
    async onLoad() {
        const {searchProductWord} = this.pos;
        try {
            var parsed_results = await this.pos.barcodeReader.parser.parse_barcode(
                searchProductWord
            );
            const productBarcode = parsed_results.find(
                (element) => element.type === "product"
            );
            this.pos.searchProductWord = productBarcode.base_code;
        } catch {
            this.pos.searchProductWord = false;
        }
    },
});
