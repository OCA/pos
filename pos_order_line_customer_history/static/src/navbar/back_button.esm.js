/** @odoo-module */

import {BackButton} from "@point_of_sale/app/navbar/back_button/back_button";
import {CustomerHistoryScreen} from "@pos_order_line_customer_history/Screens/CustomerHistoryScreen.esm";
import {patch} from "@web/core/utils/patch";

patch(BackButton.prototype, {
    async onClick() {
        if (this.pos.mainScreen.component === CustomerHistoryScreen) {
            if (this.pos.ticket_screen_mobile_pane === "left") {
                this.pos.closeScreen();
            } else {
                this.pos.ticket_screen_mobile_pane = "left";
            }
        }
        super.onClick(...arguments);
    },
});
