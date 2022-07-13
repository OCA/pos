odoo.define("pos_fixed_discount_in_lines.POSModels", function (require) {
    "use strict";

    var models = require("point_of_sale.models");
    var utils = require("web.utils");
    var round_pr = utils.round_precision;

    var _super_orderline = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        initialize: function (attr, options) {
            _super_orderline.initialize.call(this, attr, options);
            this.line_discount = 0;
        },
        compute_all: function () {
            var res = _super_orderline.compute_all.apply(this, arguments);
            if (this.pos.config.split_fixed_discount) {
                return {
                    taxes: res.taxes_vals,
                    total_excluded: round_pr(
                        res.total_excluded - this.line_discount,
                        this.pos.currency.rounding
                    ),
                    total_included: round_pr(
                        res.total_included - this.line_discount,
                        this.pos.currency.rounding
                    ),
                };
            }
            return res;
        },
    });

    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function (attr, options) {
            _super_order.initialize.call(this, attr, options);
            this.fixed_discount = 0;
            this.fixed_discount_enabled = false;
            this.save_to_db();
            return this;
        },
        get_fixed_discount: function () {
            return this.fixed_discount;
        },
        set_fixed_discount_enabled: function (fixed_discount_enabled) {
            // This.assert_editable();
            this.fixed_discount_enabled = fixed_discount_enabled;
        },
        get_fixed_discount_enabled: function () {
            return this.fixed_discount_enabled;
        },
        export_as_JSON: function () {
            var res = _super_order.export_as_JSON.apply(this, arguments);
            res.total_fixed_discount = this.fixed_discount;
            return res;
        },
    });
});
