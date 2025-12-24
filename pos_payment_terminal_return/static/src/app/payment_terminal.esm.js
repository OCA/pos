/* globals console*/

import {OCAPaymentTerminal} from "@pos_payment_terminal/app/payment_terminal.esm";
import {_t} from "@web/core/l10n/translation";
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
});
