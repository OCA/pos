/** @odoo-module alias=pos_order_to_sale_order.CreateOrderPopup**/
import AbstractAwaitablePopup from "point_of_sale.AbstractAwaitablePopup";
import Registries from "point_of_sale.Registries";
import framework from "web.framework";

class CreateOrderPopup extends AbstractAwaitablePopup {
    setup() {
        super.setup();
        this.createOrderClicked = false;
    }

    async createDraftSaleOrder() {
        await this._createSaleOrder("draft");
    }

    async createConfirmedSaleOrder() {
        await this._createSaleOrder("confirmed");
    }

    async createDeliveredSaleOrder() {
        await this._createSaleOrder("delivered");
    }

    async createInvoicedSaleOrder() {
        await this._createSaleOrder("invoiced");
    }

    async _createSaleOrder(order_state) {
        var current_order = this.env.pos.get_order();

        framework.blockUI();

        await this.rpc({
            model: "sale.order",
            method: "create_order_from_pos",
            args: [current_order.export_as_JSON(), order_state],
        })
            .catch(function (error) {
                throw error;
            })
            .finally(function () {
                framework.unblockUI();
            });

        // Delete current order
        this.env.pos.removeOrder(current_order);
        this.env.pos.add_new_order();

        // Close popup
        return await super.confirm();
    }
}

CreateOrderPopup.template = "CreateOrderPopup";
Registries.Component.add(CreateOrderPopup);
export default CreateOrderPopup;
