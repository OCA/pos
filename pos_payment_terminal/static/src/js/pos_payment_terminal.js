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
                        'payment_mode' : line.cashregister.journal.payment_mode,
                        'order_id': order.uid};
            //console.log(JSON.stringify(data));
            var promise = this.message(
                'payment_terminal_transaction_start',
                {'payment_info' : JSON.stringify(data)}
            ).then(function(response) {
                return response;
            });
            return promise;
        },
    });


    screens.PaymentScreenWidget.include({
        render_paymentlines : function(){
            this._super.apply(this, arguments);
            var self  = this;
            this.$('.paymentlines-container').unbind('click').on('click', '.payment-terminal-transaction-start', function(event) {
                // Why this "on" thing links severaltime the button to the action if I don't use "unlink" to reset the button links before ?
                self.pos.get_order().in_transaction = true;
                self.order_changes();
                self.pos.proxy.payment_terminal_transaction_start(
                    $(this).data('cid'),
                    self.pos.currency.name,
                    self.pos.currency.decimals
                ).then(function(response) {
                    if (response === false) {
                        self.gui.show_popup(
                            'error',
                            {
                                'title': _t('Payment Terminal Error'),
                                'body': _t('Failed to send the amount to pay to the payment terminal. Press the red button on the payment terminal and try again.'),
                            });
                    }
                });
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

    var _orderproto = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function(){
            _orderproto.initialize.apply(this, arguments);
            this.in_transaction = false;
        },
        export_as_JSON: function() {
            var vals = _orderproto.export_as_JSON.apply(this, arguments);
            vals['transactions'] = this.transactions || {};
            return vals;
        }
    });

});
