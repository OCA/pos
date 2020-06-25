odoo.define('pos_multi_ean.db', function (require) {
    "use strict";

    var PosDB = require('point_of_sale.DB');
    var models = require('point_of_sale.models');

    models.load_fields("product.product", ["multi_ean_json"]);

    PosDB.include({
        add_products: function(products) {
            var res = this._super(products);

            if(!products instanceof Array){
                products = [products];
            }
            for(var i = 0, len = products.length; i < len; i++){
                var product = products[i];
                var multi_ean_list = JSON.parse(product.multi_ean_json);

                for(var j = 0, jlen = multi_ean_list.length; j < jlen; j++){
                    var ean = multi_ean_list[j];
                    this.product_by_barcode[ean] = product;
                }
            }
            return res;
        },
    });

});
