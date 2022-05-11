odoo.define("pos_auto_invoice_default_partner.screens", function (require) {
    "use strict";
    var core = require("web.core");
    var screens = require("point_of_sale.screens");

    screens.PaymentScreenWidget.include({
        finalize_validation: function () {
            var order = this.pos.get_order();
            var client = order.get_client();
            var partner_id = this.pos.config.default_partner_id;
            if (order.is_to_invoice() && !client && partner_id) {
                order.set_client(this.pos.db.get_partner_by_id(partner_id[0]));
            }
            this._super();
        },
    });
});
