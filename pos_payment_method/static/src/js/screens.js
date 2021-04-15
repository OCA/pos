/*
    POS Payment Terminal module for Odoo
    Copyright 2018-21 ForgeFlow S.L. (https://www.forgeflow.com)
    @author: Adria Gil Sorribes (ForgeFlow)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define('pos_payment_method.screens', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');

    screens.PaymentScreenWidget.include({

        _get_journal: function (line_cid) {
            var line;
            var order = this.pos.get_order();
            var lines = order.get_paymentlines();
            for ( var i = 0; i < lines.length; i++ ) {
                if (lines[i].cid === line_cid) {
                    line = lines[i];
                }
            }
            return line.cashregister.journal
        },

        process_payment_terminal: function (line_cid) {
            this.journal = this._get_journal(line_cid)
        },

        click_delete_paymentline: function (cid) {
            var order = this.pos.get_order()
            var lines = order.get_paymentlines();

            for (var i = 0; i < lines.length; i++) {
                if (lines[i].cid === cid && order.in_transaction) {
                    order.in_transaction = false;
                    this.order_changes();
                    this.cancel_payment_terminal(cid);
                }
            }

            this._super(cid);
        },

        cancel_payment_terminal: function (line_cid) {
            this.journal = this._get_journal(line_cid)
        },

        render_paymentlines : function(){
            this._super.apply(this, arguments);
            var self  = this;
            this.$('.paymentlines-container').unbind('click').on('click', '.transaction-start', function(event){
                self.pos.get_order().in_transaction = true;
                self.order_changes();
                // Call specific function
                self.process_payment_terminal($(this).data('cid'));
            }).on('click', '.transaction-cancel', function(event){
                self.pos.get_order().in_transaction = false;
                self.order_changes();
                // Call specific function
                self.cancel_payment_terminal($(this).data('cid'));
            });
        },

        order_changes: function(){
            this._super.apply(this, arguments);
            var order = this.pos.get_order();
            if (!order) {
                return;
            } else if (order.in_transaction) {
                this.$('.in_transaction').removeClass('oe_hidden');
                this.$('.payment-terminal-transaction').toggleClass('oe_hidden');
            } else {
                this.$('.in_transaction').addClass('oe_hidden');
                this.$('.payment-terminal-transaction').toggleClass('oe_hidden');
            }
        }
    });

});
