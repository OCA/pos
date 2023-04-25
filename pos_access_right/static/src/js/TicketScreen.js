odoo.define("pos_access_right.TicketScreen", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const TicketScreen = require("point_of_sale.TicketScreen");

    const PosTicketScreen = (TicketScreen) =>
        class extends TicketScreen {
            get hasNewOrdersControlRights() {
                if (this.env.pos.config.module_pos_hr)
                    return this.env.pos.get_cashier().hasGroupMultiOrder;
                return this.env.pos.user.hasGroupMultiOrder;
            }

            async _onDeleteOrder({detail: order}) {
                if (
                    this.env.pos.get_cashier().hasGroupDeleteOrder &&
                    this.env.pos.user.hasGroupDeleteOrder
                ) {
                    return super._onDeleteOrder({detail: order});
                }
                return false;
            }
        };

    Registries.Component.extend(TicketScreen, PosTicketScreen);

    return TicketScreen;
});
