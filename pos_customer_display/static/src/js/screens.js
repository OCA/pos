/*
Copyright (C) 2015-Today GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
 License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_customer_display.screens", function(require) {
    "use strict";

    var screens = require("point_of_sale.screens");

    screens.PaymentScreenWidget.include({
        /**
         * @override
         */
        render_paymentlines: function() {
            // Render_paymentlines is called before the proxy connection is made
            // so we check if it's already connected before attempting to send a message
            if (
                this.pos.proxy.connection &&
                this.pos.proxy.shouldUpdateCustomerDisplay()
            ) {
                const order = this.pos.get_order();
                if (!order || (order && order.get_total_with_tax() === 0)) {
                    // Render payment is called each time a new order is created
                    // (and so when lauching the PoS)
                    // in that case, we display the welcome message
                    this.pos.proxy.sendToCustomerDisplay(
                        this.pos.proxy.prepareCustomerDisplayMessage("welcome")
                    );
                } else {
                    this.pos.proxy.sendToCustomerDisplay(
                        this.pos.proxy.prepareCustomerDisplayMessage("payment")
                    );
                }
            }
            return this._super.apply(this, arguments);
        },
    });

    screens.ClientListScreenWidget.include({
        /**
         * @override
         */
        save_changes: function() {
            if (!this.pos.proxy.shouldUpdateCustomerDisplay()) {
                return this._super.apply(this, arguments);
            }
            if (this.has_client_changed()) {
                this.pos.proxy.sendToCustomerDisplay(
                    this.pos.proxy.prepareCustomerDisplayMessage("client", [
                        this.new_client,
                    ])
                );
            }
            // We disable the send of message, during the call of _super()
            // because when selecting customer, all lines are recomputed
            // and so a message is sent for each lines
            // causing useless flashes
            return this.pos.proxy.withoutCustomerDisplayUpdate(
                this._super,
                this,
                arguments
            );
        },
    });

    return screens;
});
