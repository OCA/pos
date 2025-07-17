import {Component} from "@odoo/owl";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {useService} from "@web/core/utils/hooks";
import {CreateOrderPopup} from "@pos_order_to_sale_order/components/create_order_popup/create_order_popup.esm";

export class CreateOrderButton extends Component {
    static template = "pos_order_to_sale_order.CreateOrderButton";
    setup() {
        this.pos = usePos();
        this.dialog = useService("dialog");
    }

    isEnabled() {
        const pos = this.pos;
        return (
            pos.config.iface_create_sale_order &&
            this.pos.get_order().get_partner() &&
            this.pos.get_order().get_orderlines().length !== 0
        );
    }

    onClick() {
        this.dialog.add(CreateOrderPopup);
    }
}
