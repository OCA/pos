/* Copyright 2020 Solvos Consultoría Informática
   License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/


odoo.define('pos_order_return_traceability.models', function (require) {
    'use strict';

    var models = require('point_of_sale.models');

    models.load_fields("product.product", ['pos_allow_negative_qty']);

    var orderline_super = models.Orderline.prototype;

    models.Orderline = models.Orderline.extend({

        initialize: function(){
            orderline_super.initialize.apply(this, arguments);
            this.returned_line_id = false;
            this.quantity_returnable = this.get_quantity();
        },

        export_as_JSON: function () {
            var res = orderline_super.export_as_JSON.apply(this, arguments);
            res.returned_line_id = this.returned_line_id;
            return res;
        }

    });

});
