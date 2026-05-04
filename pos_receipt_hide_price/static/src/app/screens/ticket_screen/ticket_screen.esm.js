/** @odoo-module */

import {OrderPriceHideButton} from "../../control_buttons/order_hide_price/order_hide_price.esm";
import {TicketScreen} from "@point_of_sale/app/screens/ticket_screen/ticket_screen";
import {patch} from "@web/core/utils/patch";

patch(TicketScreen, {
    components: {...TicketScreen.components, OrderPriceHideButton},
});
