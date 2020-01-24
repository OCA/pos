/*
    POS Payment Terminal module for Odoo
    Copyright (C) 2014-2016 Aurélien DUMAINE
    Copyright (C) 2014-2016 Akretion (www.akretion.com)
    @author: Aurélien DUMAINE
    @author: Alexis de Lattre <alexis.delattre@akretion.com>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define('pos_payment_terminal.devices', function (require) {
    "use strict";

    var devices = require('point_of_sale.devices');

    devices.ProxyDevice.include({

        init: function(parents, options) {
            var self = this;
            self._super(parents, options);
            self.on('change:status', this, function(eh, status) {
                if(!self.pos.chrome.screens) {
                    return;
                }
                var paymentwidget = self.pos.chrome.screens.payment;
                var drivers = status.newValue.drivers;
                var order = self.pos.get_order();
                var in_transaction = false;
                Object.keys(drivers).forEach(function(driver_name) {
                    if (drivers[driver_name].hasOwnProperty("in_transaction")) {
                        in_transaction = in_transaction || drivers[driver_name].in_transaction;
                    }

                    var transactions = drivers[driver_name].latest_transactions;
                    if(!!transactions && transactions.hasOwnProperty(order.uid)) {
                        var previous_transactions = order.transactions;
                        order.transactions = transactions[order.uid];
                        var has_new_transactions = (
                            !previous_transactions ||
                            previous_transactions.length < order.transactions.length
                        );
                        if(has_new_transactions && order.is_paid()) {
                            paymentwidget.validate_order();
                        }
                    }
                });
                order.in_transaction = in_transaction;
                paymentwidget.order_changes();
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
                        'payment_mode' : line.cashregister.journal.pos_terminal_payment_mode,
                        'order_id': order.uid};
            this.message('payment_terminal_transaction_start', {'payment_info' : JSON.stringify(data)});
        },
    });

});
