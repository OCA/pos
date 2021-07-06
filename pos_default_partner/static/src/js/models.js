odoo.define("pos_default_partner.models", function(require) {
    "use strict";

    var models = require("point_of_sale.models");

    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        get_client: function() {
            var return_val = _super_order.get_client.apply(this, arguments);
            if (return_val == undefined) {
                return_val = this.pos.db.get_partner_by_id(
                    this.pos.config.default_partner_id[0]
                );
            }
            return return_val;
        },
    });
    return models;
});
