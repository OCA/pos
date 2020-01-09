/*
Copyright (C) 2015-Today GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
 License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/


odoo.define('pos_customer_display.customer_display_2_20', function (require) {
    "use strict";

    var core = require('web.core');
    var _t = core._t;

    var CustomerDisplay_2_20 = function(proxy_device){
        this.pos = proxy_device.pos;
        this._prepare_line = proxy_device._prepare_line;

        this._prepare_message_welcome = function(){
            return new Array(
                this._prepare_line(this.pos.config.customer_display_msg_next_l1, ""),
                this._prepare_line(this.pos.config.customer_display_msg_next_l2, ""),
            );
        };

        this._prepare_message_close = function(){
            return new Array(
                this._prepare_line(this.pos.config.customer_display_msg_closed_l1, ""),
                this._prepare_line(this.pos.config.customer_display_msg_closed_l2, ""),
            );
        };

        this._prepare_message_orderline = function(order_line, action){
            var currency_rounding = this.pos.currency.decimals;

            var product_name = order_line.product.display_name;
            var unit_price_str = order_line.get_unit_price().toFixed(currency_rounding);
            var total_amount_str = order_line.get_display_price().toFixed(currency_rounding);
            var qty = order_line.get_quantity();
                // only display decimals when qty is not an integer
                if (qty.toFixed(0) == qty) {
                    qty = qty.toFixed(0);
                }
            var discount = order_line.get_discount();
            var discount_str = "";
            if ([
                    'add_line',
                    'update_quantity',
                    'update_unit_price',
                    'update_discount',
            ].indexOf(action) !== -1){
                var second_line = String(qty) + " * " + unit_price_str;
                if (discount){
                    discount_str =  " -" + String(discount) + "%";
                }
                return new Array(
                    this._prepare_line(product_name, discount_str),
                    this._prepare_line(second_line, total_amount_str),
                );
            } else if (action === 'delete_line'){
                return new Array(
                    this._prepare_line(_t("Deleting Line ..."), ""),
                    this._prepare_line(order_line.product.display_name, ""),
                );
            }
        };

        this._prepare_message_payment = function(action){
            var currency_rounding = this.pos.currency.decimals;
            var order = this.pos.get_order()
            var total = order.get_total_with_tax().toFixed(currency_rounding);
            var total_paid = order.get_total_paid().toFixed(currency_rounding);
            var total_change = order.get_due().toFixed(currency_rounding);
            var total_to_pay = (total - total_paid).toFixed(currency_rounding);

            var remaining_operation_str = "";

            if (total_paid != 0) {
                if (total_to_pay > 0) {
                    remaining_operation_str = _t("To Pay: ") + String(total_to_pay);
                } else if (total_change < 0) {
                    remaining_operation_str = _t("Returned: ") + String(- total_change);
                }
            }

            return new Array(
                this._prepare_line(_t("Total"), String(total)),
                this._prepare_line(remaining_operation_str, ""),
            );
        };

        this._prepare_message_client = function(client){
            if ( client ) {
                return new Array(
                    this._prepare_line(_t("Customer Account"), ""),
                    this._prepare_line(client.name, ""),
                );
            } else {
                return new Array(
                    this._prepare_line(_t("No Customer Account"), ""),
                    this._prepare_line("", ""),
                );
            }
        };

    };

    return {
        CustomerDisplay_2_20: CustomerDisplay_2_20,
    };

});
