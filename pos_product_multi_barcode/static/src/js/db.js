odoo.define("pos_product_multi_barcode.db", function (require) {
    "use strict";

    var PosDB = require("point_of_sale.DB");

    PosDB.include({
        _product_search_string: function (product) {
            var str = this._super(product);
            if (product.barcodes_json) {
                const barcodes = JSON.parse(product.barcodes_json).join(",");
                str = str.replace("\n", "|" + barcodes) + "\n";
            }
            return str;
        },
        add_products: function (products) {
            var res = this._super(products);
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
});
