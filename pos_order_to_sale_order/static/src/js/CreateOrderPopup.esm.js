/** @odoo-module */

import {AbstractAwaitablePopup} from "@point_of_sale/app/popup/abstract_awaitable_popup";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {useService} from "@web/core/utils/hooks";

export class CreateOrderPopup extends AbstractAwaitablePopup {
    setup() {
        super.setup();
        this.pos = usePos();
        this.ui = useService("ui");
        this.orm = useService("orm");
        this.createOrderClicked = false;
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
        return await super.confirm();
    }

    async _createSaleOrder(order_state) {
        const current_order = this.pos.get_order();
        this.ui.block();

        return await this.orm
            .call("sale.order", "create_order_from_pos", [
                current_order.export_as_JSON(),
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

CreateOrderPopup.template = "pos_order_to_sale_order.CreateOrderPopup";
