/* Copyright 2023 Aures Tic - Jose Zambudio
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define("pos_order_mgmt.CopyOrderButton", function (require) {
    "use strict";

    const {useContext} = owl.hooks;
    const PosComponent = require("point_of_sale.PosComponent");
    const OrderManagementScreen = require("point_of_sale.OrderManagementScreen");
    const Registries = require("point_of_sale.Registries");
    const contexts = require("point_of_sale.PosContext");

    class CopyOrderButton extends PosComponent {
        constructor() {
            super(...arguments);
            this.orderManagementContext = useContext(contexts.orderManagement);
        }
        async onClick() {
            const copy_order = this.orderManagementContext.selectedOrder;
            if (!copy_order) return;

            var order = this._prepare_order_from_order(copy_order);
            this.env.pos.set_order(order);
            order.trigger("change");
            this.showScreen("ProductScreen");
        }
        _prepare_order_from_order(copy_order) {
            var {pos} = this.env;
            var order = pos.add_new_order({silent: true});

            // Get Customer
            if (copy_order.partner_id) {
                order.set_client(pos.db.get_partner_by_id(copy_order.partner_id));
            }

            // Get fiscal position
            if (copy_order.fiscal_position && pos.fiscal_positions) {
                var fiscal_positions = pos.fiscal_positions;
                order.fiscal_position = fiscal_positions.filter(function (p) {
                    return p.id === copy_order.fiscal_position;
                })[0];
                order.trigger("change");
            }

            // Get order lines
            this._prepare_orderlines_from_order(order, copy_order);

            // Get to invoice
            order.set_to_invoice(copy_order.to_invoice);

            return order;
        }
        _prepare_orderlines_from_order(order, copy_order) {
            copy_order.get_orderlines().forEach(function (orderline) {
                var product = orderline.product;
                var quantity = orderline.quantity;
                order.add_product(product, {
                    price: orderline.price_unit,
                    quantity: quantity,
                    discount: orderline.discount,
                    merge: false,
                    extras: {
                        return_pack_lot_names: orderline.pack_lot_names,
                    },
                });
            });
        }
    }

    CopyOrderButton.template = "CopyOrderButton";

    OrderManagementScreen.addControlButton({
        component: CopyOrderButton,
        condition: function () {
            return this.env.pos.config.iface_copy_done_order;
        },
    });

    Registries.Component.add(CopyOrderButton);

    return CopyOrderButton;
});
