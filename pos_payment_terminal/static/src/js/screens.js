/*
    POS Payment Terminal module for Odoo
    Copyright (C) 2014-2016 Aurélien DUMAINE
    Copyright (C) 2014-2016 Akretion (www.akretion.com)
    @author: Aurélien DUMAINE
    @author: Alexis de Lattre <alexis.delattre@akretion.com>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define('pos_payment_terminal.screens', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');

    screens.PaymentScreenWidget.include({

        render_paymentlines : function(){
            this._super.apply(this, arguments);
            var self  = this;
            this.$('.paymentlines-container').unbind('click').on('click', '.payment-terminal-transaction-start', function(event){
                // Why this "on" thing links severaltime the button to the action
                // if I don't use "unlink" to reset the button links before ?
                self.pos.get_order().in_transaction = true;
                self.order_changes();
                self.pos.proxy.payment_terminal_transaction_start($(this).data('cid'), self.pos.currency.name, self.pos.currency.decimals);
            });
        },

        order_changes: function(){
            this._super.apply(this, arguments);
            var order = this.pos.get_order();
            if (!order) {
                return;
            } else if (order.in_transaction) {
                self.$('.next').html('<img src="/web/static/src/img/spin.png" style="animation: fa-spin 1s infinite steps(12);width: 20px;height: auto;vertical-align: middle;">');
            } else {
                self.$('.next').html('Validate <i class="fa fa-angle-double-right"></i>');
            }
        }
    });

});
