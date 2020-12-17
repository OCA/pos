/*
    Copyright 2020 Akretion France (http://www.akretion.com/)
    @author: Alexis de Lattre <alexis.delattre@akretion.com>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define('pos_payment_terminal.payment', function (require) {
    "use strict";

    var core = require('web.core');
    var rpc = require('web.rpc');
    var PaymentInterface = require('point_of_sale.PaymentInterface');
    const { Gui } = require('point_of_sale.Gui');

    var _t = core._t;

    var OCAPaymentTerminal = PaymentInterface.extend({
        send_payment_request: function (cid) {
            this._super.apply(this, arguments);
            return this._oca_payment_terminal_pay();
        },


        _oca_payment_terminal_pay: function () {
            var self = this;
            var order = this.pos.get_order();
            var pay_line = order.selected_paymentline;
            var currency = this.pos.currency;
            if (pay_line.amount < 0) {
                // TODO check if it's possible or not
                this._show_error(_t('Cannot process transactions with negative amount.'));
                return Promise.resolve();
            }
            var data = {
                'amount': pay_line.amount,
                'currency_iso': currency.name,
                'currency_decimals': currency.decimals,
                'payment_mode': this.payment_method.oca_payment_terminal_mode,
                'payment_id': pay_line.cid,
                'order_id': order.name,
                };
            // TODO improve behavior when response is true
            this._oca_payment_terminal_proxy_request(data).then(function(response) {
                if (response === false) {
                    self._show_error(_t('Failed to send the amount to pay to the payment terminal. Press the red button on the payment terminal and try again.'));
                    }
                else if (response === true) {
                    pay_line.set_payment_status('force_done');
                }
            });
        },

        _oca_payment_terminal_proxy_request: function (data) {
            var promise = this.pos.proxy.message(
                'payment_terminal_transaction_start',
                {'payment_info' : JSON.stringify(data)}
            ).then(function(response) {
                return response;
            });
            return promise;
        },

        _show_error: function (msg, title) {
            if (!title) {
                title =  _t('Payment Terminal Error');
            }
            Gui.showPopup('ErrorPopup', {
                'title': title,
                'body': msg,
            });
        },

    });
    return OCAPaymentTerminal;
});
