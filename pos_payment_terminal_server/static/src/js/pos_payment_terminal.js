/*
    Copyright 2019 ACSONE SA/NV
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

    This is intended to manage the Start Transaction
*/

odoo.define('pos_payment_terminal_server.pos_payment_terminal', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');
    var devices = require('point_of_sale.devices');

    screens.PaymentScreenWidget.include({
        render_paymentlines : function(){
            this._super.apply(this, arguments);
            if (this.pos.config.iface_payment_terminal_server){
                var self = this;
                this.$('.paymentlines-container').unbind('click').on('click', '.payment-terminal-transaction-start', function(event){
                    self.pos.get_order().in_transaction = true;
                    self.order_changes();
                    self.pos.terminal_server.payment_terminal_transaction_start($(this).data('cid'), self.pos.currency.name, self.pos.currency.decimals);
                });
            }
        }
    });
});
