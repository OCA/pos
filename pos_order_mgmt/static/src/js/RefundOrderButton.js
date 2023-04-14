/* Copyright 2023 Aures Tic - Jose Zambudio
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define("pos_order_mgmt.RefundOrderButton", function (require) {
    "use strict";

    const core = require("web.core");
    const {useContext} = owl.hooks;
    const PosComponent = require("point_of_sale.PosComponent");
    const OrderManagementScreen = require("point_of_sale.OrderManagementScreen");
    const Registries = require("point_of_sale.Registries");
    const contexts = require("point_of_sale.PosContext");
    const _t = core._t;

    class RefundOrderButton extends PosComponent {
        constructor() {
            super(...arguments);
            this.orderManagementContext = useContext(contexts.orderManagement);
        }
        async onClick() {
            const refund_order = this.orderManagementContext.selectedOrder;
            if (!refund_order) return;

            var order = this._prepare_order_from_order(refund_order);
            this.env.pos.set_order(order);
            order.trigger("change");
            this.showScreen("ProductScreen");
        }
        _prepare_order_from_order(refund_order) {
            var {pos} = this.env;
            var order = pos.add_new_order({silent: true});

            // Get Customer
            if (refund_order.partner_id) {
                order.set_client(pos.db.get_partner_by_id(refund_order.partner_id));
            }

            // Get fiscal position
            if (refund_order.fiscal_position && pos.fiscal_positions) {
                var fiscal_positions = pos.fiscal_positions;
                order.fiscal_position = fiscal_positions.filter(function (p) {
                    return p.id === refund_order.fiscal_position;
                })[0];
                order.trigger("change");
            }

            // Get order lines
            this._prepare_orderlines_from_order(order, refund_order);

            // Get Name
            order.name = _t("Refund ") + refund_order.uid;

            // Get to invoice
            order.set_to_invoice(refund_order.to_invoice);

            // Get returned Order
            order.returned_order_id = refund_order.backendId;

            return order;
        }
        _prepare_orderlines_from_order(order, refund_order) {
            refund_order.get_orderlines().forEach(function (orderline) {
                var product = orderline.product;
                var quantity = orderline.quantity;
                order.add_product(product, {
                    price: orderline.price_unit,
                    quantity: quantity * -1,
                    discount: orderline.discount,
                    merge: false,
                    extras: {
                        return_pack_lot_names: orderline.pack_lot_names,
                    },
                });
            });
        }
    }

    RefundOrderButton.template = "RefundOrderButton";

    OrderManagementScreen.addControlButton({
        component: RefundOrderButton,
        condition: function () {
            return this.env.pos.config.iface_return_done_order;
        },
    });

    Registries.Component.add(RefundOrderButton);

    return RefundOrderButton;
});
