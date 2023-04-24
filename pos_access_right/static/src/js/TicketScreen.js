odoo.define("pos_access_right.TicketScreen", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const TicketScreen = require("point_of_sale.TicketScreen");

    const PosTicketScreen = (TicketScreen) =>
        class extends TicketScreen {
            get hasNewOrdersControlRights() {
                return this.env.pos.get_cashier().hasGroupMultiOrder;
            }

            async deleteOrder(order) {
                if (this.env.pos.get_cashier().hasGroupDeleteOrder) {
                    return super.deleteOrder(order);
                }
                return false;
            }
        };

    Registries.Component.extend(TicketScreen, PosTicketScreen);

    return TicketScreen;
});
