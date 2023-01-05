odoo.define("pos_invoice_required.models", function(require) {
    "use strict";

    var models = require("point_of_sale.models");

    var order_super = models.Order.prototype;

    models.Order = models.Order.extend({
        initialize: function() {
            order_super.initialize.apply(this, arguments);
            this.to_invoice = this.pos.config.require_invoice === "required";
        },
    });
});
