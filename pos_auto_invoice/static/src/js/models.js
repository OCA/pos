odoo.define("pos_auto_invoice.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");

    var OrderSuper = models.Order;
    models.Order = models.Order.extend({
        initialize: function (attributes, options) {
            OrderSuper.prototype.initialize.apply(this, arguments);
            this.to_invoice = true;
        },
    });
});
