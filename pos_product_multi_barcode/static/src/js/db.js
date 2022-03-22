odoo.define("pos_product_multi_barcode.db", function (require) {
    "use strict";

    var PosDB = require("point_of_sale.DB");
    var models = require("point_of_sale.models");

    models.load_fields("product.product", ["barcodes_json"]);

    PosDB.include({
        add_products: function (products) {
            var res = this._super(products);
            var self = this;

            if (!products instanceof Array) {
                products = [products];
            }
            products.forEach(function (product) {
                var barcodes = JSON.parse(product.barcodes_json);

                barcodes.forEach(function (barcode) {
                    self.product_by_barcode[barcode] = product;
                });
            });
            return res;
        },
    });
});
