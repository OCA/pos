odoo.define("pos_cancel_reason.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");

    models.load_models([
        {
            model: "pos.cancel.reason",
            fields: ["id", "name"],
            domain: function () {
                return [["active", "=", true]];
            },
            context: function (self) {
                return {
                    pricelist: self.pricelists[0].id,
                    display_default_code: false,
                };
            },
            loaded: function (self, cancel_reasons) {
                self.cancel_reasons = cancel_reasons;
            },
        },
    ]);

    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize() {
            _super_order.initialize.apply(this, arguments);
            this.state = this.state || "new";
            this.cancel_reason_id = false;
            this.cancelled_orderlines = [];
            this.cancelled_item = false;
        },
        export_as_JSON() {
            const json = _super_order.export_as_JSON.apply(this, arguments);
            json.cancelled_orderlines = this.cancelled_orderlines;
            json.state = this.state;
            json.cancel_reason_id = this.cancel_reason_id;
            return json;
        },
        init_from_JSON(json) {
            _super_order.init_from_JSON.apply(this, arguments);
            this.cancelled_orderlines = json.cancelled_orderlines;
            this.state = json.state;
            this.cancel_reason_id = json.cancel_reason_id;
        },
        save_cancelled_orderlines_info: function (diffecence, reason) {
            const line = this.selected_orderline;
            const cancelled_orderline_object = {
                order_id: this.name,
                product_id: line.product.id,
                price_unit: line.price,
                qty: diffecence,
                price_subtotal: diffecence * line.price,
                cancel_reason_id: reason.id,
                cancelled_at: new moment().utc().format(),
            };
            if (!this.pos.get_cashier().id) {
                cancelled_orderline_object.user_id = this.pos.get_cashier().user_id[0];
            } else {
                cancelled_orderline_object.employee_id = this.pos.get_cashier().id;
            }
            this.cancelled_orderlines.push(cancelled_orderline_object);
        },
    });

    var orderline_super = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        initialize() {
            orderline_super.initialize.apply(this, arguments);
            this.created_at = new moment().utc().format();
        },
    });
});
