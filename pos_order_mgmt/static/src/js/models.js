/* Copyright 2018 Tecnativa - David Vidal
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define('pos_order_mgmt.models', function (require) {
    'use strict';

    var models = require('point_of_sale.models');

    var order_super = models.Order.prototype;
    var _super_orderline = models.Orderline.prototype;

    models.Order = models.Order.extend({
        init_from_JSON: function (json) {
            order_super.init_from_JSON.apply(this, arguments);
            this.returned_order_id = json.returned_order_id;
            this.returned_order_reference = json.returned_order_reference;
        },
        export_as_JSON: function () {
            var res = order_super.export_as_JSON.apply(this, arguments);
            res.returned_order_id = this.returned_order_id;
            res.returned_order_reference = this.returned_order_reference;
            return res;
        },
        export_for_printing: function () {
            var res = order_super.export_for_printing.apply(this, arguments);
            res.returned_order_id = this.returned_order_id;
            res.returned_order_reference = this.returned_order_reference;
            return res;
        },
    });

    models.Orderline = models.Orderline.extend({
        initialize: function() {
            _super_orderline.initialize.apply(this,arguments);
            if (!this.return_lot_no) {
                this.return_lot_no  = '';
            }
        },
        init_from_JSON: function(json) {
            _super_orderline.init_from_JSON.apply(this,arguments);
            this.return_lot_no = json.return_lot_no;
        },
        export_as_JSON: function() {
            var json = _super_orderline.export_as_JSON.apply(this,arguments);
            json.return_lot_no = this.return_lot_no;
            return json;
        },
    });

});
