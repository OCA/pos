odoo.define("pos_order_to_purchase_order.PosOrderToPurchaseOrderButton", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const ProductScreen = require("point_of_sale.ProductScreen");
    const {useListener} = require("web.custom_hooks");
    const Registries = require("point_of_sale.Registries");
    const {_t} = require("web.core");

    class PosOrderToPurchaseOrderButton extends PosComponent {
        constructor() {
            super(...arguments);
            useListener("click", this.onClick);
        }
        async onClick() {
            var self = this;
            var order = this.env.pos.get_order();
            var order_lines = order.get_orderlines();
            var orderJson = this.env.pos.get('selectedOrder').export_as_JSON()
            if (!order_lines.length) {
                return this.showPopup("ErrorPopup", {
                    title: _t("Empty Order"),
                    body: _t("You need add some products"),
                });
            }
            if (!order.get_client()) {
                return this.showPopup("ErrorPopup", {
                    title: _t("Empty client"),
                    body: _t("You need add a client"),

                });
            }
            const {confirmed, payload} = await this.showPopup("PosOrderToPurchaseOrderPopup", {
                title: this.env._t("Create Purchase Order"),
                order: order,
                order_lines: order_lines,
                orderJson: orderJson,
            });
        }
    }
    PosOrderToPurchaseOrderButton.template = "PosOrderToPurchaseOrderButton";

    ProductScreen.addControlButton({
        component: PosOrderToPurchaseOrderButton,
        condition: function () {
            return this.env.pos.config.iface_create_draft_purchase_order;
        },
    });

    Registries.Component.add(PosOrderToPurchaseOrderButton);

    return PosOrderToPurchaseOrderButton;
});
