/** @odoo-module */

import {PosDB} from "@point_of_sale/app/store/db";
import {patch} from "@web/core/utils/patch";

patch(PosDB.prototype, {
    _product_search_string(product) {
        var res = super._product_search_string(product).replace("\n", "");
        var supplier_data_list = JSON.parse(product.supplier_data_json);
        for (var i = 0, len = supplier_data_list.length; i < len; i++) {
            var supplier_data = supplier_data_list[i];
            if (supplier_data.supplier_name) {
                res += "|" + supplier_data.supplier_name.replace(/:/g, "");
            }
            if (supplier_data.supplier_product_code) {
                res += "|" + supplier_data.supplier_product_code.replace(/:/g, "");
            }
            if (supplier_data.supplier_product_name) {
                res += "|" + supplier_data.supplier_product_name.replace(/:/g, "");
            }
        }
        res += "\n";
        return res;
    },
});
