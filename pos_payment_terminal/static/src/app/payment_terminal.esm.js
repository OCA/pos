/* globals setInterval, clearInterval, console*/

import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {PaymentInterface} from "@point_of_sale/app/payment/payment_interface";
import {_t} from "@web/core/l10n/translation";
import {register_payment_method} from "@point_of_sale/app/store/pos_store";

export class OCAPaymentTerminal extends PaymentInterface {
    get fast_payments() {
        const order = this.pos.get_order();
        const paymentLine = order.get_selected_paymentline();
        return (
            paymentLine &&
            paymentLine.payment_method_id.use_payment_terminal ===
                "oca_payment_terminal" &&
            paymentLine.payment_method_id.oca_fast_payment
        );
    }

    async send_payment_request(uuid) {
        await super.send_payment_request(uuid);
        return this._ocaPaymentTerminalPay(uuid);
    }

    send_payment_cancel(order, uuid) {
        super.send_payment_cancel(order, uuid);
        return this._ocaPaymentTerminalCancel();
    }

    pendingOCAPaymentLine() {
        return this.pos.getPendingPaymentLine("oca_payment_terminal");
    }

    _ocaPaymentTerminalGetData(uuid) {
        const order = this.pos.get_order();
        const line = order.get_selected_paymentline();
        const transactionId = order.name
            .replace(" ", "")
            .replaceAll("-", "")
            .toUpperCase();
        const currency = this.pos.currency;
        return {
            amount: line.amount,
            currency_iso: currency.name,
            currency_decimals: currency.decimals,
            payment_mode: this.payment_method_id.oca_payment_terminal_mode,
            payment_id: uuid,
            order_id: transactionId,
        };
    }

    _ocaPaymentTerminalPay(uuid) {
        const order = this.pos.get_order();
        if (order.get_selected_paymentline().amount <= 0) {
            this._showError(_t("Cannot process transactions with negative amount."));
            return Promise.resolve(false);
        }
        this._ocaPendingResolve = null;
        const data = this._ocaPaymentTerminalGetData(uuid);
        if (this.payment_method_id.oca_payment_terminal_id) {
            data.terminal_id = this.payment_method_id.oca_payment_terminal_id;
        }
        return this._callOCAPaymentTerminal(data).then((response) => {
            return this._handleOCAPaymentTerminalResponse(response);
        });
    }

    _handleOCAPaymentTerminalResponse(response) {
        const line = this.pendingOCAPaymentLine();
        if (!response) {
            this._showError(
                _t(
                    "Failed to send the amount to pay to the payment terminal." +
                        "Press the red button on the payment terminal and try again."
                )
            );
            // There was an error, let the user retry.
            return Promise.resolve(false);
        } else if (response instanceof Object && "transaction_id" in response) {
            line.set_payment_status("waitingCard");
            this._setTransactionStatus(line, response);
            return new Promise((resolve, reject) => {
                this._ocaPollForTransactionStatus(line, resolve, reject);
            });
        } else if (response === true) {
            // The driver does not report the transaction outcome: wait for
            // the cashier to force done or cancel the payment.
            line.set_payment_status("waitingCard");
            return new Promise((resolve) => {
                this._ocaPendingResolve = resolve;
            });
        }
        return Promise.resolve(false);
    }

    _ocaPollForTransactionStatus(paymentLine, resolve, reject) {
        const timerId = setInterval(() => {
            // Query the driver status more frequently than the regular POS
            // proxy, to get faster feedback when the transaction is
            // complete on the terminal.
            const status_params = {};
            if (this.payment_method_id.oca_payment_terminal_id) {
                status_params.terminal_id =
                    this.payment_method_id.oca_payment_terminal_id;
            }
            this.pos.hardwareProxy
                .message("status_json", status_params)
                .then((drivers) => {
                    for (const driver_name in drivers) {
                        // Look for a driver that is a payment terminal and has transactions.
                        const driver = drivers[driver_name];
                        if (!driver.is_terminal || !("transactions" in driver)) {
                            continue;
                        }
                        for (const transaction_id in driver.transactions) {
                            const transaction = driver.transactions[transaction_id];
                            if (
                                transaction.transaction_id ===
                                paymentLine.terminal_transaction_id
                            ) {
                                // Look for the transaction corresponding to
                                // the payment line.
                                this._setTransactionStatus(paymentLine, transaction);
                                if (paymentLine.terminal_transaction_success !== null) {
                                    resolve(paymentLine.terminal_transaction_success);
                                    // Stop the loop
                                    clearInterval(timerId);
                                }
                            }
                        }
                    }
                })
                .catch(() => {
                    console.error("Error querying terminal driver status");
                    // We could not query the transaction status so we
                    // won't know the transaction result: we let the user
                    // enter the outcome manually. This is done by
                    // rejecting the promise as explained in the
                    // send_payment_request() documentation.
                    paymentLine.set_payment_status("force_done");
                    reject();
                    // Stop the loop
                    clearInterval(timerId);
                });
        }, 1000);
    }

    _setTransactionStatus(paymentLine, transaction) {
        paymentLine.terminal_transaction_id = transaction.transaction_id;
        paymentLine.terminal_transaction_success = transaction.success;
        paymentLine.terminal_transaction_status = transaction.status;
        paymentLine.terminal_transaction_status_details = transaction.status_details;
        // Payment transaction reference, for accounting reconciliation purposes.
        paymentLine.transaction_id = transaction.transaction_id;
    }

    _callOCAPaymentTerminal(data) {
        return this.pos.hardwareProxy
            .message("payment_terminal_transaction_start", {
                payment_info: JSON.stringify(data),
            })
            .then((response) => {
                return response;
            })
            .catch(() => {
                console.error("Error starting payment transaction");
                return false;
            });
    }

    _ocaPaymentTerminalCancel() {
        const line = this.pendingOCAPaymentLine();
        line.set_payment_status("retry");
        if (this._ocaPendingResolve) {
            this._ocaPendingResolve(false);
            this._ocaPendingResolve = null;
        }
        return true;
    }

    _showError(msg, title) {
        this.env.services.dialog.add(AlertDialog, {
            title: title || _t("Payment Terminal Error"),
            body: msg,
        });
    }
}

register_payment_method("oca_payment_terminal", OCAPaymentTerminal);
