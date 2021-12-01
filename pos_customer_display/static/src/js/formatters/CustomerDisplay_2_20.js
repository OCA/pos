/*
    Copyright 2015-Today GRAP (http://www.grap.coop)
    Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_customer_display.CustomerDisplay_2_20", function(require) {
    "use strict";

    const AbstractDisplayFormatter = require("pos_customer_display.AbstractDisplayFormatter");
    const core = require("web.core");
    const _t = core._t;

    const CustomerDisplay_2_20 = AbstractDisplayFormatter.extend({
        prepareMessage_welcome: function() {
            return new Array(
                this.prepareLine(this.pos.config.customer_display_msg_next_l1, ""),
                this.prepareLine(this.pos.config.customer_display_msg_next_l2, "")
            );
        },
        prepareMessage_close: function() {
            return new Array(
                this.prepareLine(this.pos.config.customer_display_msg_closed_l1, ""),
                this.prepareLine(this.pos.config.customer_display_msg_closed_l2, "")
            );
        },
        prepareMessage_orderline: function(orderLine, action) {
            // Only display decimals when qty is not an integer
            let qty = orderLine.get_quantity();
            if (qty.toFixed(0) === qty) {
                qty = qty.toFixed(0);
            }
            if (
                [
                    "add_line",
                    "update_quantity",
                    "update_unit_price",
                    "update_discount",
                ].includes(action)
            ) {
                return new Array(
                    this.prepareLine(
                        orderLine.get_product().display_name,
                        orderLine.get_discount()
                            ? " -" + String(orderLine.get_discount()) + "%"
                            : ""
                    ),
                    this.prepareLine(
                        String(qty) +
                            " * " +
                            orderLine
                                .get_unit_price()
                                .toFixed(this.pos.currency.decimals),
                        orderLine
                            .get_display_price()
                            .toFixed(this.pos.currency.decimals)
                    )
                );
            } else if (action === "delete_line") {
                return new Array(
                    this.prepareLine(_t("Deleting Line ..."), ""),
                    this.prepareLine(orderLine.get_product().display_name, "")
                );
            }
        },
        prepareMessage_payment: function() {
            const currency_rounding = this.pos.currency.decimals;
            const order = this.pos.get_order();
            const total = order.get_total_with_tax().toFixed(currency_rounding);
            const total_paid = order.get_total_paid().toFixed(currency_rounding);
            const total_change = order.get_due().toFixed(currency_rounding);
            const total_to_pay = (total - total_paid).toFixed(currency_rounding);
            let remaining_operation_str = "";

            if (total_paid != 0) {
                if (total_to_pay > 0) {
                    remaining_operation_str = _t("To Pay: ") + String(total_to_pay);
                } else if (total_change < 0) {
                    remaining_operation_str = _t("Returned: ") + String(-total_change);
                }
            }
            return new Array(
                this.prepareLine(_t("Total"), String(total)),
                this.prepareLine(remaining_operation_str, "")
            );
        },
        prepareMessage_client: function(client) {
            if (client) {
                return new Array(
                    this.prepareLine(_t("Customer Account"), ""),
                    this.prepareLine(client.name, "")
                );
            }
            return new Array(
                this.prepareLine(_t("No Customer Account"), ""),
                this.prepareLine("", "")
            );
        },
    });

    return CustomerDisplay_2_20;
});
