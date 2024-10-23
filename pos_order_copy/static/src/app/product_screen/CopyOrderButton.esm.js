/** @odoo-module */
/*
    Copyright 2024 Dixmit
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
import {Component} from "@odoo/owl";
import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {usePos} from "@point_of_sale/app/store/pos_hook";

export class CopyOrderButton extends Component {
    setup() {
        this.pos = usePos();
    }

    onClick() {
        var order = this.pos.get_order();
        this.pos.copy_on_new_order(order);
        this.pos.showScreen("ProductScreen");
    }
}
CopyOrderButton.template = "pos_order_copy.CopyOrderButton";

ProductScreen.addControlButton({
    component: CopyOrderButton,
});
