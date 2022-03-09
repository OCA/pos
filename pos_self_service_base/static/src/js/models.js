odoo.define("pos_self_service_base.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");

    // We need to change the way the regular UI sees the orders
    var _super_posmodel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        set_start_order: function () {
            if (!this.config.iface_self_service) {
                _super_posmodel.set_start_order.apply(this, arguments);
            }
        },
    });
});
