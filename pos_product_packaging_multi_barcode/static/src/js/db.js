odoo.define("pos_product_packaging_multi_barcode.db", function (require) {
    "use strict";

    var PosDB = require("point_of_sale.DB");

    PosDB.include({
        add_packagings: function (packagings) {
            this._super(packagings);
            var old_packaging_by_barcode = {
                ...this.product_packaging_by_barcode,
            };
            var new_packaging_by_barcode = {};
            Object.values(old_packaging_by_barcode).forEach(function (packaging) {
                var barcodes = JSON.parse(packaging.barcodes_json);
                barcodes.forEach(function (barcode) {
                    if (!(barcode in old_packaging_by_barcode)) {
                        new_packaging_by_barcode[barcode] = packaging;
                    }
                });
            });
            this.product_packaging_by_barcode = {
                ...old_packaging_by_barcode,
                ...new_packaging_by_barcode,
            };
        },
    });
});
