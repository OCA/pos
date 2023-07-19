odoo.define("pos_cancel_reason.TicketButton", function (require) {
    "use strict";

    const TicketButton = require("point_of_sale.TicketButton");
    const Registries = require("point_of_sale.Registries");

    const PosCancelReasonTicketButton = (TicketButton) =>
        class extends TicketButton {
            check_cancelled_orders(res) {
                const not_cancelled_orders = [];

                for (var i = 0; i < res.length; i++) {
                    if (res[i].state !== "cancel") {
                        not_cancelled_orders.push(res[i]);
                    }
                }

                return not_cancelled_orders.length;
            }
            get count() {
                if (this.env.pos) {
                    return this.check_cancelled_orders(this.env.pos.get_order_list());
                }

                return 0;
            }
        };

    Registries.Component.extend(TicketButton, PosCancelReasonTicketButton);

    return TicketButton;
});
