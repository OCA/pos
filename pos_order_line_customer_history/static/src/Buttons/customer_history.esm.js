/** @odoo-module **/

import {Component} from "@odoo/owl";
import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {usePos} from "@point_of_sale/app/store/pos_hook";

export class CustomerHistoryButton extends Component {
    static template = "pos_order_line_customer_history.CustomerHistoryButton";
    setup() {
        this.pos = usePos();
    }
    async click() {
        const searchDetails = {};
        this.pos.showScreen("CustomerHistoryScreen", {
            ui: {filter: "SYNCED", searchDetails},
        });
    }
}

ProductScreen.addControlButton({
    component: CustomerHistoryButton,
    condition: function () {
        const order = this.pos.get_order();
        return Boolean(order && order.get_partner());
    },
});
