/** @odoo-module **/

import {Component, useState} from "@odoo/owl";
import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {usePos} from "@point_of_sale/app/store/pos_hook";

export class OrderPriceHideButton extends Component {
    static template = "pos_receipt_hide_price.OrderPriceHideButton";

    setup() {
        this.pos = usePos();
        this.hidePriceState = useState({priceHidden: false});
    }

    async click() {
        const order = this.pos.get_order();
        this.hidePriceState.priceHidden = !this.hidePriceState.priceHidden;
        if (order) {
            order.hidePriceOrder = this.priceHidden;
        }
    }

    get priceHidden() {
        return this.hidePriceState.priceHidden;
    }
}

ProductScreen.addControlButton({
    component: OrderPriceHideButton,
});
