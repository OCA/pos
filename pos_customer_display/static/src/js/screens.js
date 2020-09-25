/*
Copyright (C) 2015-Today GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
 License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define('pos_customer_display.screens', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');

    screens.PaymentScreenWidget.include({

        render_paymentlines: function() {
            if (
                !this.pos.get_order() ||
                (this.pos.get_order() && this.pos.get_order().get_total_with_tax() === 0)
            ) {
                // Render payment is called each time a new order is created
                // (and so when lauching the PoS)
                // in that case, we display the welcome message
                this.pos.proxy.send_text_customer_display(
                    this.pos.proxy.prepare_message_welcome()
                );
            } else {
                this.pos.proxy.send_text_customer_display(
                    this.pos.proxy.prepare_message_payment()
                );
            }
            return this._super();
        },

    });

    screens.ClientListScreenWidget.include({

        save_changes: function(){
            if(this.has_client_changed()){
                this.pos.proxy.send_text_customer_display(
                    this.pos.proxy.prepare_message_client(this.new_client)
                );
            }
            // we disable the send of message, during the call of _super()
            // because when selecting customer, all lines are recomputed
            // and so a message is sent for each lines
            // causing useless flashes
            this.pos.send_message_customer_display = false;
            var res = this._super();
            this.pos.send_message_customer_display = true;
            return res;
        },
    });

});
