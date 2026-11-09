/* globals console*/

import {OCAPaymentTerminal} from "@pos_payment_terminal/app/payment_terminal.esm";
import {_t} from "@web/core/l10n/translation";
import {ask} from "@point_of_sale/app/store/make_awaitable_dialog";
import {patch} from "@web/core/utils/patch";
import {roundPrecision} from "@web/core/utils/numbers";

patch(OCAPaymentTerminal.prototype, {
    wait_terminal_answer() {
        if (
            this.payment_method_id.use_payment_terminal === "oca_payment_terminal" &&
            this.payment_method_id.oca_payment_terminal_return
        ) {
            return true;
        }
        return false;
    },

    _ocaPaymentTerminalGetData(uuid) {
        const data = super._ocaPaymentTerminalGetData(uuid);
        const waitAnswer = this.wait_terminal_answer();
        if (waitAnswer) {
            data.wait_terminal_answer = waitAnswer;
        }
        return data;
    },

    _callOCAPaymentTerminal(data) {
        if (!this.wait_terminal_answer()) {
            return super._callOCAPaymentTerminal(data);
        }
        return this.pos.hardwareProxy
            .message("payment_terminal_transaction_start_with_return", {
                payment_info: JSON.stringify(data),
            })
            .then((response) => {
                return response;
            })
            .catch(() => {
                console.error("Error starting payment transaction");
                return false;
            });
    },

    _handleOCAPaymentTerminalResponse(response) {
        if (this.wait_terminal_answer()) {
            if (!response) {
                this._showError(
                    _t(
                        "Failed to send the amount to pay to the payment terminal." +
                            "Press the red button on the payment terminal and try again."
                    )
                );
                // There was an error, let the user retry.
                return Promise.resolve(false);
            }
            if (response.result_unknown) {
                return this._askOCAPaymentTerminalUnknownResult(response);
            }
            const line = this.pendingOCAPaymentLine();
            if (response.transaction_result === 0) {
                const rounding = this.pos.currency.rounding;
                const amount_in = roundPrecision(response.amount_msg / 100, rounding);
                if (amount_in !== 0) {
                    line.set_amount(amount_in);
                    if ("payment_terminal_return_message" in response) {
                        const msg = response.payment_terminal_return_message;
                        line.set_payment_terminal_return_message(
                            typeof msg === "object" ? JSON.stringify(msg) : msg
                        );
                    }
                }
                return Promise.resolve(true);
            }
            if (
                response.transaction_result === null ||
                response.transaction_result === undefined
            ) {
                // No payment result: PyWebDriver says why in error_code
                // (older versions send an empty answer).
                this._showError(this._ocaPaymentTerminalErrorMessage(response));
                return Promise.resolve(false);
            }
            const returnMsg = response.payment_terminal_return_message;
            this._showError(
                _t(
                    "Failed to payment terminal with return message: %s",
                    typeof returnMsg === "object"
                        ? JSON.stringify(returnMsg)
                        : returnMsg
                )
            );
            return Promise.resolve(false);
        }
        return super._handleOCAPaymentTerminalResponse(response);
    },

    _ocaPaymentTerminalErrorMessage(response) {
        switch (response.error_code) {
            case "port_error":
                return _t(
                    "The POS cannot open the payment terminal port. Check that " +
                        "the terminal is plugged in, and its port in the " +
                        "PyWebDriver configuration."
                );
            case "no_answer":
                return _t(
                    "The payment terminal did not answer. Check that it is " +
                        "switched on, connected and on its idle screen, then try again."
                );
            case "unsupported":
                return _t(
                    "This payment mode or currency is not supported by the " +
                        "payment terminal."
                );
            case "amount_refused":
                return _t(
                    "The payment terminal did not accept the amount: it may be " +
                        "busy with a previous transaction. Press the red button on " +
                        "the terminal, then try again."
                );
        }
        const msg = response.payment_terminal_return_message;
        if (typeof msg === "string" && msg) {
            return msg;
        }
        return _t(
            "No answer from the payment terminal. Check that it is switched on " +
                "and connected, then try again."
        );
    },

    /**
     * The terminal took the amount but its answer never reached the driver,
     * so the bank may have approved the payment. Telling the cashier to
     * retry could charge the customer twice, or leave a paid sale unrecorded:
     * let the cashier settle it from the terminal's merchant receipt instead.
     *
     * @returns {Promise<Boolean>} true to record the payment, false to retry
     */
    async _askOCAPaymentTerminalUnknownResult(response) {
        const intro =
            response.error_code === "timeout"
                ? _t(
                      "No answer from the payment terminal within %s seconds " +
                          "after it took the amount, so the payment may have " +
                          "been approved.",
                      response.waiting_timeout
                  )
                : _t(
                      "The payment terminal took the amount, but its answer did " +
                          "not reach the POS, so the payment may have been approved."
                  );
        const approved = await ask(this.env.services.dialog, {
            title: _t("Payment result unknown"),
            body:
                intro +
                "\n\n" +
                _t(
                    "Check the merchant receipt printed by the terminal:\n" +
                        '- Approved: click "Approved" to record the payment.\n' +
                        '- Refused, or no receipt: click "Not approved", then retry.'
                ),
            confirmLabel: _t("Approved"),
            cancelLabel: _t("Not approved"),
        });
        const line = this.pendingOCAPaymentLine();
        if (approved && line) {
            line.set_payment_terminal_return_message(
                response.payment_terminal_return_message
            );
        }
        return approved;
    },
});
