odoo.define("pos_multi_discount.POSModels", function (require) {
    "use strict";

    var models = require("point_of_sale.models");
    var utils = require("web.utils");
    var round_pr = utils.round_precision;
    var field_utils = require("web.field_utils");

    var _super_orderline = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        initialize: function (attr, options) {
            _super_orderline.initialize.call(this, attr, options);
            this.manual_discount = 0;
        },
        init_from_JSON: function (json) {
            _super_orderline.init_from_JSON.apply(this, arguments);
            this.manual_discount = json.manual_discount;
        },
        set_discount: function (discount) {
            var parsed_discount =
                typeof discount === "number"
                    ? discount
                    : isNaN(parseFloat(discount))
                    ? 0
                    : field_utils.parse.float(String(discount));
            var disc = Math.min(Math.max(parsed_discount || 0, 0), 100);
            this.manual_discount = disc;
            this.discount = this.manual_discount + 0; // + fixed disc + % disc
            this.discountStr = String(disc);
            this.trigger("change", this);
        },
        get_manual_discount: function () {
            return this.manual_discount;
        },
        export_as_JSON: function () {
            var vals = _super_orderline.export_as_JSON.apply(this, arguments);
            vals.manual_discount = this.manual_discount;
            return vals;
        },
    });
});
