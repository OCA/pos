odoo.define("point_of_sale.CreateOrderPopup", function (require) {
    "use strict";

    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const Registries = require("point_of_sale.Registries");
    const framework = require("web.framework");

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
                    current_order.destroy();
                });

            return await super.confirm();
        }
    }

    CreateOrderPopup.template = "CreateOrderPopup";
    Registries.Component.add(CreateOrderPopup);

    return CreateOrderPopup;
});
