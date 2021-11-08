odoo.define("pos_supplierinfo_barcode.db", function (require) {
    "use strict";

    var PosDB = require("point_of_sale.DB");
    var models = require("point_of_sale.models");

    models.load_fields("product.product", ["supplier_barcode_json"]);

    PosDB.include({
        add_products: function (products) {
            var res = this._super(products);

            if (!products instanceof Array) {
                products = [products];
            }
            for (var i = 0, len = products.length; i < len; i++) {
                var product = products[i];
                var supplier_barcode_list = JSON.parse(product.supplier_barcode_json);

                for (var j = 0, jlen = supplier_barcode_list.length; j < jlen; j++) {
                    var supplier_barcode = supplier_barcode_list[j];
                    this.product_by_barcode[supplier_barcode] = product;
                }
            }
            return res;
        },
    });
});
