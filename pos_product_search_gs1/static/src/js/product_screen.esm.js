/** @odoo-module **/

import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {patch} from "@web/core/utils/patch";

patch(ProductScreen.prototype, {
    async _parseElementsFromGS1(parsed_results) {
        const productBarcode = parsed_results.find(
            (element) => element.type === "product"
        );
        let lotBarcode = parsed_results.find((element) => element.ai === "21");
        if (!lotBarcode) {
            lotBarcode = parsed_results.find((element) => element.type === "lot");
        }
        const product = await this._getProductByBarcode(productBarcode);
        return {product, lotBarcode, customProductOptions: {}};
    },
});
