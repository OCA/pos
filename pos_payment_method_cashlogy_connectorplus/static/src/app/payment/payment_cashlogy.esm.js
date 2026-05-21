/* Copyright 2026 Tecnativa - David Bañón
   License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).*/

import {
    AlertDialog,
    ConfirmationDialog,
} from "@web/core/confirmation_dialog/confirmation_dialog";
import {PaymentInterface} from "@point_of_sale/app/payment/payment_interface";
import {_t} from "@web/core/l10n/translation";
import {register_payment_method} from "@point_of_sale/app/store/pos_store";
export class PaymentCashlogy extends PaymentInterface {
    /**
     * @override
     */
    setup() {
        super.setup(...arguments);
        this.ongoing_payment_key = false;
        this.ongoing_refund = false;
    }

    /**
     * @override
     */
    async send_payment_reversal() {
        super.send_payment_reversal(...arguments);
        console.log("Payment reversal called");
        // TODO: Implement cashlogy reversal
        this.env.services.dialog.add(AlertDialog, {
            title: _t("Error"),
            body: _t("Not implemented yet"),
        });
        return false;
    }

    /**
     * @override
     */
    async send_payment_cancel() {
        super.send_payment_cancel(...arguments);
        // Connectorplus doesn't support canceling a payment via the API, so we can
        // only ask the user to cancel it themselves.
        if (this.ongoing_refund) {
            this.env.services.dialog.add(AlertDialog, {
                title: _t("Error"),
                body: _t("Cash refunds can't be canceled!"),
            });
        } else {
            this.env.services.dialog.add(AlertDialog, {
                body: _t("You must cancel the payment manually from the terminal."),
                title: _t("Manual cancel required."),
            });
        }
        return false;
    }
    /**
     * @override
     */
    async send_payment_request() {
        super.send_payment_request(...arguments);
        const order = this.pos.get_order();
        const payment_line = order.get_selected_paymentline();
        const amount = Math.round(order.get_due(payment_line) * 100);
        if (amount >= 0) {
            return this.cashlogy_send_payment_request(amount, order, payment_line);
        }
        return this.cashlogy_send_dispense_request(
            Math.abs(amount),
            order,
            payment_line
        );
    }

    // --------------------------------------------------------------------------
    // Private
    // --------------------------------------------------------------------------
    async cashlogy_check_payment_cancel(payment_line) {
        // We can't tell the terminal to cancel a payment,
        // so we must trust that the user does it manually.
        // if the payment is cancelled from the machine first and not odoo we already
        // handle it in _cashlogy_wait_payment_done
        const method = this.payment_method_id;
        if (!this.ongoing_payment_key) {
            return true;
        }
        const payment_statuses = await method._cashlogy_get_payment_statuses();
        if (
            (payment_statuses?.[this.ongoing_payment_key] || "CANCELLED") in
            ["CANCELLED", "SUCCESS"]
        ) {
            return true;
        }

        return new Promise((resolve, reject) => {
            this.env.services.dialog.add(ConfirmationDialog, {
                body: _t("You must cancel the payment manually from the terminal."),
                title: _t("Manual cancel required."),
                confirmLabel: _t("Payment canceled."),
                cancelLabel: _t("Continue payment."),
                confirm: async () => {
                    // We call this again to prevent the dialog from closing if
                    // the payment hasn't been canceled on the terminal.
                    this.cashlogy_check_payment_cancel(payment_line);
                },
                cancel: () => {
                    reject("Continue with payment");
                },
            });
        });
    }
    async cashlogy_send_payment_request(amount, order, payment_line) {
        // The payment is done in the following steps:
        // 1. The POS send a payment request, to which the cashlogy respondes
        //    with an operation id.
        // 2. Then the POS has to ask the cashlogy machine for the payment status
        //    until it returns "status": "FINISHED" and "result": "SUCCESS"
        const method = this.payment_method_id;
        const res = await method._cashlogy_request_payment_start(amount, order.name);
        if (res.result === "FAILED_BUSY") {
            payment_line.set_payment_status("retry");
            this.env.services.dialog.add(AlertDialog, {
                title: _t("Error"),
                body: _t(
                    "A payment/refund request is alredy ongoing on the Cashlogy Terminal!\n" +
                        "Please finish or cancel it before starting a new one"
                ),
            });
            return false;
        }
        if (res.result === "FAILED") {
            payment_line.set_payment_status("retry");
            this.env.services.dialog.add(AlertDialog, {
                title: _t("Error"),
                body: _t("Unknown error when requesting payment start!: "),
            });
            console.log(res);
            return false;
        }
        payment_line.set_payment_status("waiting");
        this.ongoing_payment_key = res.id;
        const result = await method._cashlogy_wait_payment_done(
            this.ongoing_payment_key
        );
        this.ongoing_payment_key = false;
        return result;
    }
    async cashlogy_send_dispense_request(amount, order, payment_line) {
        // Works like a payment, but with different endpoints
        // 1. The POS send a dispense request
        // 2. Then the POS has to ask the cashlogy machine for the dispense status
        //    until it returns "status": "FINISHED" and "result": "SUCCESS"
        const method = this.payment_method_id;
        const res = await method._cashlogy_request_dispense_start(amount, order.name);
        if (res.result === "FAILED_BUSY") {
            payment_line.set_payment_status("retry");
            this.env.services.dialog.add(AlertDialog, {
                title: _t("Error"),
                body: _t(
                    "A payment/refund request is alredy ongoing on the Cashlogy Terminal!\n" +
                        "Please finish or cancel it before starting a new one"
                ),
            });
            return false;
        }
        if (res.result === "FAILED") {
            payment_line.set_payment_status("retry");
            this.env.services.dialog.add(AlertDialog, {
                title: _t("Error"),
                body: _t("Unknown error when requesting dispense start!"),
            });
            console.log(res);
            return false;
        }
        payment_line.set_payment_status("waiting");
        this.ongoing_refund = true;
        const result = await method._cashlogy_wait_dispense_done();
        this.ongoing_refund = true;
        return result;
    }
}

register_payment_method("cashlogy", PaymentCashlogy);
