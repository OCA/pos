/*
Copyright (C) 2015-Today GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
 License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define('pos_customer_display.models', function (require) {
    "use strict";

    var models = require('point_of_sale.models');
    var OrderSuper = models.Order;
    var OrderlineSuper = models.Orderline;
    var PosModelSuper = models.PosModel;

    // //////////////////////////////////
    // Overload models.PosModel
    // //////////////////////////////////
    models.PosModel = models.PosModel.extend({

        initialize: function(session, attributes) {
            var res = PosModelSuper.prototype.initialize.call(this, session, attributes);
            // send_message_customer_display is a variable that allow
            // to disable the send of the message to the customer display
            // This desing is due to the current design of Odoo PoS.
            // 1) during the call_of_init_from_JSON, a call to
            // add_product and remove_orderline is done.
            // 2) during the call of add_product, a call
            // to set_price, set_discount, set_quantity is done.
            // To avoid multiple useless messages sends.
            // it fixed this @via-alexis comment:
            // https://github.com/OCA/pos/blob/10.0/pos_customer_display/
            // static/src/js/customer_display.js#L198
            this.send_message_customer_display = true;
            return res;
        },

        after_load_server_data: function(){
            this.proxy.load_customer_display_format_file();
            return PosModelSuper.prototype.after_load_server_data.call(this);
        },
    });


    // //////////////////////////////////
    // Overload models.Order
    // //////////////////////////////////
    models.Order = models.Order.extend({

        init_from_JSON: function(json) {
            this.pos.send_message_customer_display = false;
            var res = OrderSuper.prototype.init_from_JSON.call(this, json);
            this.pos.send_message_customer_display = true;
            return res;
        },

        add_product: function(product, options){
            var send_message = this.pos.send_message_customer_display;
            this.pos.send_message_customer_display = false;
            var res = OrderSuper.prototype.add_product.call(this, product, options);
            if (send_message){
                this.pos.proxy.send_text_customer_display(
                    this.pos.proxy.prepare_message_orderline(
                        this.get_last_orderline(), 'add_line'));
                this.pos.send_message_customer_display = true;
            }
            return res;
        },

    });

    //////////////////////////////////
    // Overload models.Orderline
    //////////////////////////////////
    models.Orderline = models.Orderline.extend({

        set_quantity: function(quantity, keep_price){
            var send_message = this.pos.send_message_customer_display;
            var message;
            this.pos.send_message_customer_display = false;

            // In the current Odoo design, set_quantity is call to remove line
            // so we prepare the message before because after the call
            // of super, the line is delete.
            if (send_message){
                if (quantity === 'remove') {
                    message = this.pos.proxy.prepare_message_orderline(this, 'delete_line');
                }
            }
            var res = OrderlineSuper.prototype.set_quantity.call(this, quantity, keep_price);
            if (send_message) {
                if (quantity !== 'remove'){
                    message = this.pos.proxy.prepare_message_orderline(this, 'update_quantity');
                }
                this.pos.send_message_customer_display = true;
                this.pos.proxy.send_text_customer_display(message);
            }
            return res;
        },

        set_discount: function(discount){
            var send_message = this.pos.send_message_customer_display;
            this.pos.send_message_customer_display = false;

            var res = OrderlineSuper.prototype.set_discount.call(this, discount);
            if (send_message) {
                this.pos.send_message_customer_display = true;
                this.pos.proxy.send_text_customer_display(
                    this.pos.proxy.prepare_message_orderline(this, 'update_discount'));
            }
            return res;
        },

        set_unit_price: function(price){
            var send_message = this.pos.send_message_customer_display;
            this.pos.send_message_customer_display = false;

            var res = OrderlineSuper.prototype.set_unit_price.call(this, price);
            if (send_message) {
                this.pos.send_message_customer_display = true;
                this.pos.proxy.send_text_customer_display(
                    this.pos.proxy.prepare_message_orderline(this, 'update_unit_price'));
            }
            return res;
        },

    });

    var _config = _.findWhere(
        models.PosModel.prototype.models,
        {model: "pos.config"}
    );
    var old_loaded = _config.loaded
    _config.loaded = function (self, configs) {
        old_loaded(self, configs);
        if (self.config.iface_customer_display){
            self.config.use_proxy = true;
        }
    }
});
