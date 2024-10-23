/** @odoo-module **/

import {TicketScreen} from "@point_of_sale/app/screens/ticket_screen/ticket_screen";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(TicketScreen.prototype, {
    onDoFullRefund() {
        var selected_order = this.getSelectedOrder();
        for (const line of selected_order.orderlines) {
            this.onClickOrderline(line);
            for (const char of line.quantity.toString()) {
                this._onUpdateSelectedOrderline({key: char, buffer: char});
            }
        }
        var pay_button = document.querySelector(".pay");
        pay_button.click();
    },
});
