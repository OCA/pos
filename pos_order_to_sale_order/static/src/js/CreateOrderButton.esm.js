/** @odoo-module */

import {Component} from "@odoo/owl";
import {CreateOrderPopup} from "./CreateOrderPopup.esm";
import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {useService} from "@web/core/utils/hooks";

export class CreateOrderButton extends Component {
    setup() {
        this.popup = useService("popup");
    }

    onClick() {
        this.popup.add(CreateOrderPopup, {zIndex: 1069});
    }
}

CreateOrderButton.template = "pos_order_to_sale_order.CreateOrderButton";

ProductScreen.addControlButton({
    component: CreateOrderButton,
    condition: function () {
        return (
            this.pos.config.iface_create_sale_order &&
            this.pos.get_order().get_partner() &&
            this.pos.get_order().get_orderlines().length !== 0
        );
    },
});
