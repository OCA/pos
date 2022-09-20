odoo.define("pos_multi_discount_global.POSModels", function (require) {
    "use strict";

    var models = require("point_of_sale.models");
    var field_utils = require("web.field_utils");

    var _super_orderline = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        initialize: function (attr, options) {
            _super_orderline.initialize.call(this, attr, options);
            this.fixed_discount = 0;
            this.percent_discount = 0;
        },
        init_from_JSON: function (json) {
            _super_orderline.init_from_JSON.apply(this, arguments);
            this.fixed_discount = json.fixed_discount;
            this.percent_discount = json.percent_discount;
        },
        set_discount: function (discount) {
            // Fixed_discount comes here as percent
            var parsed_discount =
                typeof discount === "number"
                    ? discount
                    : isNaN(parseFloat(discount))
                    ? 0
                    : field_utils.parse.float(String(discount));
            var disc = Math.min(Math.max(parsed_discount || 0, 0), 100);
            this.manual_discount = disc;
            // This.discount = this.manual_discount + this.fixed_discount; // + fixed disc + % disc
            this.discount = 0;
            if (
                this.fixed_discount > 0 &&
                this.percent_discount > 0 &&
                this.manual_discount > 0
            ) {
                discount =
                    100 -
                    (1 - this.manual_discount / 100) *
                        (1 - this.fixed_discount / 100) *
                        (1 - this.percent_discount / 100) *
                        100;
                this.discount = this.round_dec(discount);
            } else if (this.fixed_discount > 0 && this.manual_discount > 0) {
                discount =
                    100 -
                    (1 - this.manual_discount / 100) *
                        (1 - this.fixed_discount / 100) *
                        100;
                this.discount = this.round_dec(discount);
            } else if (this.percent_discount > 0 && this.manual_discount > 0) {
                discount =
                    100 -
                    (1 - this.manual_discount / 100) *
                        (1 - this.percent_discount / 100) *
                        100;
                this.discount = this.round_dec(discount);
            } else if (this.percent_discount > 0 && this.fixed_discount > 0) {
                discount =
                    100 -
                    (1 - this.percent_discount / 100) *
                        (1 - this.fixed_discount / 100) *
                        100;
                this.discount = this.round_dec(discount);
            } else if (this.fixed_discount > 0) {
                this.discount = this.round_dec(this.fixed_discount);
            } else if (this.percent_discount > 0) {
                this.discount = this.round_dec(this.percent_discount);
            } else if (this.manual_discount > 0) {
                this.discount = this.manual_discount;
            }
            this.discountStr = String(this.discount);
            this.trigger("change", this);
        },
        get_fixed_discount: function () {
            return this.fixed_discount;
        },
        get_percent_discount: function () {
            return this.percent_discount;
        },
        export_as_JSON: function () {
            var vals = _super_orderline.export_as_JSON.apply(this, arguments);
            vals.fixed_discount = this.fixed_discount;
            vals.percent_discount = this.percent_discount;
            return vals;
        },
        round_dec: function (val) {
            return Number(Math.round(val + "e2") + "e-2");
        },
    });

    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function (attr, options) {
            _super_order.initialize.call(this, attr, options);
            this.fixed_discount = 0;
            this.percent_discount = 0;
            this.fixed_discount_enabled = false;
            this.percent_discount_enabled = false;
            this.save_to_db();
            return this;
        },
        get_fixed_discount: function () {
            return this.fixed_discount;
        },
        get_percent_discount: function () {
            return this.percent_discount;
        },
        set_fixed_discount_enabled: function (fixed_discount_enabled) {
            this.fixed_discount_enabled = fixed_discount_enabled;
        },
        get_fixed_discount_enabled: function () {
            return this.fixed_discount_enabled;
        },
        set_percent_discount_enabled: function (percent_discount_enabled) {
            this.percent_discount_enabled = percent_discount_enabled;
        },
        get_percent_discount_enabled: function () {
            return this.percent_discount_enabled;
        },
        export_as_JSON: function () {
            var res = _super_order.export_as_JSON.apply(this, arguments);
            res.total_fixed_discount = this.fixed_discount;
            res.total_percent_discount = this.percent_discount;
            return res;
        },
    });
});
