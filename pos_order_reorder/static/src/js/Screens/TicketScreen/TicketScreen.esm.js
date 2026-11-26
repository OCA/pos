import {TicketScreen} from "@point_of_sale/app/screens/ticket_screen/ticket_screen";
import {patch} from "@web/core/utils/patch";
import {ReorderButton} from "@pos_order_reorder/js/Screens/TicketScreen/ControlButtons/ReorderButton.esm";

patch(TicketScreen, {
    components: {...TicketScreen.components, ReorderButton},
});
