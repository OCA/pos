odoo.define("pos_discount_reason.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");

    models.load_models([
        {
            model: "pos.discount.reason",
            loaded: function (self, discount_reason) {
                self.discount_reasons = {
                    order_discount_reasons: {},
                    line_discount_reasons: {},
                    models: {},
                    get_by_id: function (id) {
                        return this.models[id];
                    },
                };
                _.each(discount_reason, function (discount) {
                    self.discount_reasons.models[discount.id] = discount;

                    if (
                        discount.discount_use === "line" ||
                        discount.discount_use === "both"
                    ) {
                        self.discount_reasons.line_discount_reasons[
                            discount.id
                        ] = discount;
                    }
                    if (
                        discount.discount_use === "order" ||
                        discount.discount_use === "both"
                    ) {
                        self.discount_reasons.order_discount_reasons[
                            discount.id
                        ] = discount;
                    }
                });
            },
        },
    ]);

    models.Order = models.Order.extend({
        set_discount_reason: function (reason) {
            var lines = this.get_orderlines();
            for (const ind in lines) {
                lines[ind].set_discount_reason(reason);
            }
            this.deselect_orderline();
        },
    });

    const _super_orderline = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        initialize: function () {
            _super_orderline.initialize.apply(this, arguments);
            this.discount_reason_id = this.discount_reason_id || null;
        },
        export_as_JSON: function () {
            const json = _super_orderline.export_as_JSON.apply(this, arguments);
            json.discount_reason_id = this.discount_reason_id;
            return json;
        },
        init_from_JSON: function (json) {
            _super_orderline.init_from_JSON.apply(this, arguments);
            this.discount_reason_id = json.discount_reason_id;
        },
        set_discount_reason: function (reason) {
            if (reason.percent) {
                this.discount_reason_id = reason.id;
            } else {
                this.discount_reason_id = null;
            }
            this.set_discount(reason.percent * 100);
            this.trigger("change", this);
        },
        clone: function () {
            const orderline = _super_orderline.clone.apply(this, arguments);
            orderline.discount_reason_id = this.discount_reason_id;
            return orderline;
        },
    });

    models.PosModel = models.PosModel.extend({
        _mount_discount_options: function () {
            const discount_options = [];
            for (const item in this.discount_reasons.order_discount_reasons) {
                const reason = this.discount_reasons.get_by_id(item);
                const reason_value = " - " + reason.percent * 100 + "%";
                discount_options.push({
                    label: reason.name + reason_value,
                    item: reason,
                    id: reason.id,
                });
            }

            return discount_options;
        },
    });
});
