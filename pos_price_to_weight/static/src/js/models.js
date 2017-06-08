///*
//    Copyright (C) 2017-Today: La Louve (<http://www.lalouve.net/>)
//    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
//    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
//*/


odoo.define('pos_price_to_weight.models', function (require) {
    "use strict";

    var models = require('point_of_sale.models');

    var _super_PosModel = models.PosModel.prototype;

    models.PosModel = models.PosModel.extend({

        scan_product: function(parsed_code) {
            if (! (parsed_code.type === 'price_to_weight')){
                // Normal behaviour
                return _super_PosModel.scan_product.apply(this, [parsed_code]);
            }
            // Compute quantity, based on price and unit price
            var selectedOrder = this.get_order();
            var product = this.db.get_product_by_barcode(parsed_code.base_code);
            if(!product){
                return false;
            }
            var quantity = 0;
            var price = parseFloat(parsed_code.value) || 0;
            if (price !== 0 && product.price !== 0){
                quantity = price / product.price;
            }
            selectedOrder.add_product(product, {quantity:  quantity, merge: false});
            return true;
        },

    });
});
