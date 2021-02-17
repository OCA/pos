/*
    Copyright 2020 Akretion France (http://www.akretion.com/)
    @author: Alexis de Lattre <alexis.delattre@akretion.com>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_payment_terminal.payment", function (require) {
    "use strict";

    var core = require("web.core");
    var PaymentInterface = require("point_of_sale.PaymentInterface");
    const {Gui} = require("point_of_sale.Gui");

    var _t = core._t;

    var OCAPaymentTerminal = PaymentInterface.extend({
        send_payment_request: function () {
            this._super.apply(this, arguments);
            return this._oca_payment_terminal_pay();
        },

        _oca_payment_terminal_pay: function () {
            var order = this.pos.get_order();
            var pay_line = order.selected_paymentline;
            var currency = this.pos.currency;
            if (pay_line.amount < 0) {
                // TODO check if it's possible or not
                this._show_error(
                    _t("Cannot process transactions with negative amount.")
                );
                return Promise.resolve();
            }
            var data = {
                amount: pay_line.amount,
                currency_iso: currency.name,
                currency_decimals: currency.decimals,
                payment_mode: this.payment_method.oca_payment_terminal_mode,
                payment_id: pay_line.cid,
                order_id: order.name,
            };
            return this._oca_payment_terminal_proxy_request(data).then((response) => {
                if (response === false) {
                    this._show_error(
                        _t(
                            "Failed to send the amount to pay to the payment terminal. Press the red button on the payment terminal and try again."
                        )
                    );
                    // There was an error, let the user retry.
                    return false;
                }
                // TODO: handle the case where response has a terminal
                // transaction identifier and return a promise that polls
                // for transaction success or error.

                // The transaction was started, but the terminal driver
                // does not report status, so we won't know the
                // transaction result: we let the user enter the
                // outcome manually. This is done by rejecting the
                // promise as explained in the send_payment_request()
                // documentation.
                pay_line.set_payment_status("force_done");
                return Promise.reject();
            });
        },

        _oca_payment_terminal_proxy_request: function (data) {
            return this.pos.proxy
                .message("payment_terminal_transaction_start", {
                    payment_info: JSON.stringify(data),
                })
                .then((response) => {
                    return response;
                })
                .catch((error) => {
                    console.error(
                        "Error starting payment transaction:",
                        error,
                        error.stack
                    );
                    return false;
                });
        },

        _show_error: function (msg, title) {
            Gui.showPopup("ErrorPopup", {
                title: title || _t("Payment Terminal Error"),
                body: msg,
            });
        },
    });
    return OCAPaymentTerminal;
});
