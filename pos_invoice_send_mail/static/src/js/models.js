/* Copyright 2019 Druidoo - Iván Todorovich
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */
   
odoo.define('pos_invoice_send_mail.models', function (require) {
    "use strict";

    var models = require('point_of_sale.models');


    var PosModelSuper = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        push_and_invoice_order: function(order) {
            var client = order.get_client()
            if (order.is_to_send_mail() && client && !client.email) {
                var res = new $.Deferred();
                res.reject({code:400, message:'Missing Customer Email', data:{}});
                return res;
            }
            return PosModelSuper.push_and_invoice_order.apply(this, arguments);
        },
    });


    var OrderSuper = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function(attributes, options) {
            OrderSuper.initialize.apply(this, arguments);
            this.to_send_mail = false;
        },
        set_to_send_mail: function(to_send_mail) {
            this.assert_editable();
            this.to_send_mail = to_send_mail;
        },
        is_to_send_mail: function() {
            return this.to_send_mail;
        },
        // We export to JSON so we can send this to the backend
        // without having to reimplement push_and_invoice_order
        export_as_JSON: function () {
            var res = OrderSuper.export_as_JSON.apply(this, arguments);
            res.to_send_mail = this.to_send_mail;
            return res;
        },
    });

});
