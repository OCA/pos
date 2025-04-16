odoo.define("pos_access_right.TicketScreen", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const TicketScreen = require("point_of_sale.TicketScreen");

    const PosTicketScreen = (OriginalTicketScreen) =>
        class extends OriginalTicketScreen {
            get hasNewOrdersControlRights() {
                if (this.env.pos.config.module_pos_hr)
                    return this.env.pos.cashier.hasGroupMultiOrder;
                return this.env.pos.user.hasGroupMultiOrder;
            }

            async deleteOrder(order) {
                if (
                    this.env.pos.config.module_pos_hr &&
                    this.env.pos.cashier.hasGroupDeleteOrder
                )
                    return super.deleteOrder(order);
                else if (
                    !this.env.pos.config.module_pos_hr &&
                    this.env.pos.user.hasGroupDeleteOrder
                )
                    return super.deleteOrder(order);
                return false;
            }
        };

    Registries.Component.extend(TicketScreen, PosTicketScreen);

    return TicketScreen;
});
