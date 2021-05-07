/*
Copyright (C) 2015-Today GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
 License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/


odoo.define('pos_customer_display.devices', function (require) {
    "use strict";

    var devices = require('point_of_sale.devices');

    var customer_display_2_20 = require('pos_customer_display.customer_display_2_20');

    var ProxyDeviceSuper = devices.ProxyDevice;

    devices.ProxyDevice = devices.ProxyDevice.extend({


        init: function(parent, options){
            var res = ProxyDeviceSuper.prototype.init.call(this, parent, options);
            this.customer_display_proxy = false;
            return res;
        },

        load_customer_display_format_file: function(){
            if (this.pos.config.customer_display_format == "2_20") {
                this.customer_display_proxy = new customer_display_2_20.CustomerDisplay_2_20(this);
            } else {
                console.warn("No Javascript file found for the Customer Display format" + this.config.customer_display_format);
            }
        },

        send_text_customer_display: function(data){
            if (this.customer_display_proxy) {
                return this.message(
                    'send_text_customer_display',
                    {'text_to_display' : JSON.stringify(data)}
                );
            }
        },

        _prepare_line: function(left_part, right_part){
            if (left_part === false){
                left_part = "";
            }
            if (right_part === false){
                right_part = "";
            }
            var line_length = this.pos.config.customer_display_line_length;
            var max_left_length = line_length;
            if (right_part.length !== 0) {
                max_left_length -= right_part.length;
            }
            var result = left_part.substring(0, max_left_length - 1);
            result = result.padEnd(max_left_length);
            if (right_part.length !== 0) {
                result +=  right_part.padStart(line_length - result.length);
            }
            return result;
        },

        prepare_message_orderline: function(order_line, action){
            if (this.customer_display_proxy) {
                return this.customer_display_proxy._prepare_message_orderline(order_line, action);
            }
        },

        prepare_message_payment: function(action){
            if (this.customer_display_proxy) {
                return this.customer_display_proxy._prepare_message_payment(action);
            }
        },

        prepare_message_welcome: function(){
            if (this.customer_display_proxy) {
                return this.customer_display_proxy._prepare_message_welcome();
            }
        },

        prepare_message_close: function(){
            if (this.customer_display_proxy) {
                return this.customer_display_proxy._prepare_message_close();
            }
        },

        prepare_message_client: function(client){
            if (this.customer_display_proxy) {
                return this.customer_display_proxy._prepare_message_client(client);
            }
        }

    });
});
