import {useService} from "@web/core/utils/hooks";

import {Dialog} from "@web/core/dialog/dialog";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {Component} from "@odoo/owl";

export class CreateOrderPopup extends Component {
    static template = "pos_order_to_sale_order.CreateOrderPopup";
    static components = {Dialog};
    static props = ["close"];

    setup() {
        super.setup();
        this.pos = usePos();
        this.ui = useService("ui");
        this.orm = useService("orm");
    }

    async createDraftSaleOrder() {
        await this._actionCreateSaleOrder("draft");
    }

    async createConfirmedSaleOrder() {
        await this._actionCreateSaleOrder("confirmed");
    }

    async createDeliveredSaleOrder() {
        await this._actionCreateSaleOrder("delivered");
    }

    async createInvoicedSaleOrder() {
        await this._actionCreateSaleOrder("invoiced");
    }

    async _actionCreateSaleOrder(order_state) {
        // Create Sale Order
        await this._createSaleOrder(order_state);

        // Delete current order
        const current_order = this.pos.get_order();
        this.pos.removeOrder(current_order);
        this.pos.add_new_order();

        // Close popup
        return this.props.close();
    }

    async _createSaleOrder(order_state) {
        const current_order = this.pos.get_order();
        this.ui.block();

        return await this.orm
            .call("sale.order", "create_order_from_pos", [
                current_order.serialize({orm: true}),
                order_state,
            ])
            .catch((error) => {
                throw error;
            })
            .finally(() => {
                this.ui.unblock();
            });
    }
}
