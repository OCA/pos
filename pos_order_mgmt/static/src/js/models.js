/* Copyright 2018 Tecnativa - David Vidal
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define('pos_order_mgmt.models', function (require) {
    'use strict';

    var models = require('point_of_sale.models');

    var _PosModel_push_order = models.PosModel.prototype.push_order;
    models.PosModel.prototype.push_order = function () {
        var res = _PosModel_push_order.apply(this, arguments);
        if (arguments.length && arguments[0] && arguments[0].uid) {
            var order = this.db.get_order(arguments[0].uid);
            if (order && order.data) {
                var data = _.extend({}, order.data);
                var partner = this.db.get_partner_by_id(data.partner_id);
                if (partner && partner.id && partner.name) {
                    data.partner_id = [partner.id, partner.name];
                }
                data.date_order = moment(order.data.creation_date)
                    .format('YYYY-MM-DD HH:mm:ss');
                this.gui.screen_instances.orderlist.orders.unshift(data);
            }
        }
        return res;
    };

    var order_super = models.Order.prototype;
    models.Order = models.Order.extend({
        init_from_JSON: function (json) {
            order_super.init_from_JSON.apply(this, arguments);
            this.return = json.return;
            this.returned_order_id = json.returned_order_id;
            this.origin_name = json.origin_name;
        },
        export_as_JSON: function () {
            var res = order_super.export_as_JSON.apply(this, arguments);
            if (this.return) {
                res.origin_name = this.origin_name;
                res.returned_order_id = this.returned_order_id;
                res.return = this.return;
            }
            return res;
        },
    });
});
