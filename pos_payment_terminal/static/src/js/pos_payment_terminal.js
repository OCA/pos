/*
    POS Payment Terminal module for Odoo
    Copyright (C) 2014-2016 Aurélien DUMAINE
    Copyright (C) 2014-2016 Akretion (www.akretion.com)
    @author: Aurélien DUMAINE
    @author: Alexis de Lattre <alexis.delattre@akretion.com>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define('pos_payment_terminal.pos_payment_terminal', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');
    var devices = require('point_of_sale.devices');
    var models = require('point_of_sale.models');
    var core = require('web.core');
    var _t = core._t;
    var QWeb = core.qweb;

    models.load_fields('account.journal', ['payment_mode']);

    devices.ProxyDevice.include({
        init: function(parents, options) {
            var self = this;
            self._super(parents, options);
            self.on('change:status', this, function(eh, status) {
                var drivers = status.newValue.drivers;
                var order = self.pos.get_order();
                Object.keys(drivers).forEach(function(driver_name) {
                    var transactions = drivers[driver_name].latest_transactions;
                    if(!!transactions && transactions.hasOwnProperty(order.uid)) {
                        order.transactions = transactions[order.uid];
                        var order_total = Math.round(order.get_total_with_tax() * 100.0);
                        var paid_total = order.transactions.map(function(t) {
                            return t.amount_cents;
                        }).reduce(function add(a, b) {
                            return a + b;
                        }, 0);
                        if(order_total === paid_total) {
                            self.pos.chrome.screens.payment.validate_order();
                        }
                    }
                });
            });
        },
        payment_terminal_transaction_start: function(line_cid, currency_iso, currency_decimals){
            var line;
            var order = this.pos.get_order();
            var lines = order.get_paymentlines();
            for ( var i = 0; i < lines.length; i++ ) {
                if (lines[i].cid === line_cid) {
                    line = lines[i];
                }
            }

            var data = {'amount' : line.get_amount(),
                        'currency_iso' : currency_iso,
                        'currency_decimals' : currency_decimals,
                        'payment_mode' : line.cashregister.journal.payment_mode,
                        'order_id': order.uid};
            //console.log(JSON.stringify(data));
            this.message('payment_terminal_transaction_start', {'payment_info' : JSON.stringify(data)});
        },
    });


    screens.PaymentScreenWidget.include({
        render_paymentlines : function(){
        this._super.apply(this, arguments);
            var self  = this;
            this.$('.paymentlines-container').unbind('click').on('click', '.payment-terminal-transaction-start', function(event){
            // Why this "on" thing links severaltime the button to the action if I don't use "unlink" to reset the button links before ?
            //console.log(event.target);
            self.pos.proxy.payment_terminal_transaction_start($(this).data('cid'), self.pos.currency.name, self.pos.currency.decimals);
            });
        },
    });

    var _orderproto = models.Order.prototype;
    models.Order = models.Order.extend({
        export_as_JSON: function() {
            var vals = _orderproto.export_as_JSON.apply(this, arguments);
            vals['transactions'] = this.transactions || {};
            return vals;
        }
    })
});
