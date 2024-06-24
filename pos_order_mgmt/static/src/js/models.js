/* Copyright 2018 Tecnativa - David Vidal
   Copyright 2023 Aures Tic - Jose Zambudio
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define("pos_order_mgmt.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");
    const field_utils = require("web.field_utils");

    const _orderproto = models.Order.prototype;
    const _orderLineProto = models.Orderline.prototype;

    models.Order = models.Order.extend({
        init_from_JSON: function (json) {
            _orderproto.init_from_JSON.apply(this, arguments);
            this.returned_order_id = json.returned_order_id;
        },
        export_as_JSON: function () {
            var res = _orderproto.export_as_JSON.apply(this, arguments);
            res.returned_order_id = this.returned_order_id;
            return res;
        },
        export_for_printing: function () {
            var res = _orderproto.export_for_printing.apply(this, arguments);
            res.returned_order_id = this.returned_order_id;
            return res;
        },
    });

    models.Orderline = models.Orderline.extend({
        set_quantity: function (quantity, keep_price) {
            if (quantity !== "remove") {
                quantity =
                    typeof quantity === "number"
                        ? quantity
                        : field_utils.parse.float(String(quantity)) || 0;
                if (this.returned_orderline_id) {
                    quantity = Math.abs(quantity) * -1;
                }
            }
            return _orderLineProto.set_quantity.call(this, quantity, keep_price);
        },
    });
});
