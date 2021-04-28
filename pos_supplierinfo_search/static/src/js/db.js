odoo.define("pos_supplierinfo_search.db", function (require) {
    "use strict";

    var PosDB = require("point_of_sale.DB");
    var models = require("point_of_sale.models");

    models.load_fields("product.product", ["supplier_data_json"]);

    PosDB.include({
        _product_search_string: function (product) {
            var res = this._super(product).replace("\n", "");
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
});
