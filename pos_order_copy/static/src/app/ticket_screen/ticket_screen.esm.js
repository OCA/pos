/** @odoo-module */
/*
    Copyright 2024 Dixmit
    License OPL-1.0 or later (https://www.odoo.com/documentation/15.0/es/legal/licenses.html#odoo-apps).
*/
import {TicketScreen} from "@point_of_sale/app/screens/ticket_screen/ticket_screen";
import {patch} from "@web/core/utils/patch";

patch(TicketScreen.prototype, {
    _copyOrder(order) {
        this.pos.copy_on_new_order(order);
        this.pos.showScreen("ProductScreen");
    },
});
