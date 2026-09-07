/** @odoo-module */

import {PosDB} from "@point_of_sale/app/store/db";
import {patch} from "@web/core/utils/patch";

patch(PosDB.prototype, {
    _product_search_string(product) {
        var str = super._product_search_string(product);
        if (product.barcodes_json) {
            const barcodes = JSON.parse(product.barcodes_json).join(",");
            str = str.replace("\n", "|" + barcodes) + "\n";
        }
        return str;
    },
    add_products(products) {
        var res = super.add_products(products);
        var self = this;

        products.forEach(function (product) {
            var barcodes = JSON.parse(product.barcodes_json);

            barcodes.forEach(function (barcode) {
                if (barcode in self.product_by_barcode) {
                    return;
                }
                self.product_by_barcode[barcode] = product;
            });
        });
        return res;
    },
});
