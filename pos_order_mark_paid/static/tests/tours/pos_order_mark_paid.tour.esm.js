/** @odoo-module */
/* global posmodel */
/* Copyright 2026 Cetmix OÜ
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import * as Chrome from "@point_of_sale/../tests/tours/helpers/ChromeTourMethods";
import * as ErrorPopup from "@point_of_sale/../tests/tours/helpers/ErrorPopupTourMethods";
import * as PaymentScreen from "@point_of_sale/../tests/tours/helpers/PaymentScreenTourMethods";
import * as ProductScreen from "@point_of_sale/../tests/tours/helpers/ProductScreenTourMethods";
import * as ReceiptScreen from "@point_of_sale/../tests/tours/helpers/ReceiptScreenTourMethods";
import {registry} from "@web/core/registry";

function clickMarkPaid() {
    return [
        {
            content: "click Mark as Paid",
            trigger: ".payment-buttons .js_mark_paid",
        },
    ];
}

function isMarkedPaid(marked = true) {
    return [
        {
            content: `the order is ${marked ? "" : "not "}marked as paid`,
            trigger: marked
                ? ".payment-buttons .js_mark_paid.highlight"
                : ".payment-buttons .js_mark_paid:not(.highlight)",
            isCheck: true,
        },
    ];
}

function writeOffIs(amount) {
    return [
        {
            content: `write-off is ${amount}`,
            trigger: `.payment-status-write-off .amount:contains("${amount}")`,
            isCheck: true,
        },
    ];
}

function validateIsDisabled() {
    return [
        {
            content: "validate button is disabled",
            trigger: ".payment-screen .button.next.disabled",
            isCheck: true,
        },
    ];
}

function refused(message) {
    return [
        ...clickMarkPaid(),
        {
            content: `the error popup says '${message}'`,
            trigger: `.modal-dialog .popup-error .modal-body:contains("${message}")`,
            isCheck: true,
        },
        ...ErrorPopup.clickConfirm(),
        ...isMarkedPaid(false),
    ];
}

function setSelectedPaymentStatus(status) {
    return [
        {
            content: `set the status of the selected payment line to '${status}'`,
            trigger: ".paymentlines .paymentline.selected",
            run: () => {
                posmodel.get_order().selected_paymentline.set_payment_status(status);
            },
        },
    ];
}

registry.category("web_tour.tours").add("PosOrderMarkPaidTour", {
    test: true,
    url: "/pos/ui",
    steps: () =>
        [
            ProductScreen.confirmOpeningPopup(),
            ProductScreen.clickHomeCategory(),

            // Order 1, total 20.90: refused write-offs.
            ProductScreen.clickDisplayedProduct("Mark Paid A"),
            ProductScreen.clickPayButton(),
            PaymentScreen.clickPaymentMethod("Bank"),
            PaymentScreen.enterPaymentLineAmount("Bank", "20"),
            refused("Mark as Paid requires a cash payment."),
            PaymentScreen.clickPaymentlineDelButton("Bank", "20.00"),
            PaymentScreen.clickPaymentMethod("Cash"),
            PaymentScreen.enterPaymentLineAmount("Cash", "19"),
            refused("exceeds the maximum write-off"),
            PaymentScreen.clickPaymentlineDelButton("Cash", "19.00"),
            PaymentScreen.clickPaymentMethod("Cash"),
            PaymentScreen.enterPaymentLineAmount("Cash", "20"),
            refused("of the order total"),
            PaymentScreen.clickPaymentMethod("Customer Account"),
            PaymentScreen.enterPaymentLineAmount("Customer Account", "0"),
            refused("Customer Account"),
            PaymentScreen.clickPaymentlineDelButton("Customer Account", "0.00"),
            PaymentScreen.clickPaymentlineDelButton("Cash", "20.00"),
            PaymentScreen.clickPaymentMethod("Cash"),
            PaymentScreen.clickValidate(),
            ReceiptScreen.clickNextOrder(),

            // Order 2, total 10.07: pending line, unmark, clear, then write-off.
            ProductScreen.clickDisplayedProduct("Mark Paid B"),
            ProductScreen.clickPayButton(),
            PaymentScreen.clickPaymentMethod("Cash"),
            PaymentScreen.enterPaymentLineAmount("Cash", "10"),
            // Wait for the buffered numpad input: "0.07" also matches "9.07".
            PaymentScreen.selectedPaymentlineHas("Cash", "10.00"),
            PaymentScreen.remainingIs("0.07"),
            // A pending line is left out of the paid amount: the residual stays 0.07.
            PaymentScreen.clickPaymentMethod("Bank"),
            setSelectedPaymentStatus("waiting"),
            refused("Finish or remove the pending payments first."),
            // Back to no status first: deleting a waiting line calls its terminal.
            setSelectedPaymentStatus(""),
            PaymentScreen.clickPaymentlineDelButton("Bank", "0.07"),
            PaymentScreen.clickPaymentline("Cash", "10.00"),

            clickMarkPaid(),
            isMarkedPaid(),
            PaymentScreen.remainingIs("0.00"),
            writeOffIs("0.07"),
            PaymentScreen.validateButtonIsHighlighted(true),
            clickMarkPaid(),
            isMarkedPaid(false),
            PaymentScreen.remainingIs("0.07"),
            validateIsDisabled(),

            clickMarkPaid(),
            isMarkedPaid(),
            PaymentScreen.pressNumpad("⌫"),
            isMarkedPaid(false),
            validateIsDisabled(),
            // Selecting the line reset the numpad buffer: "⌫" set the amount to 0.
            PaymentScreen.pressNumpad("1 0"),
            PaymentScreen.selectedPaymentlineHas("Cash", "10.00"),
            PaymentScreen.remainingIs("0.07"),

            clickMarkPaid(),
            isMarkedPaid(),
            setSelectedPaymentStatus("waiting"),
            {
                content: "click Validate while a payment line is waiting",
                trigger: ".payment-screen .button.next",
            },
            isMarkedPaid(false),
            PaymentScreen.isShown(),
            setSelectedPaymentStatus(""),

            clickMarkPaid(),
            isMarkedPaid(),
            PaymentScreen.clickValidate(),
            ReceiptScreen.isShown(),
            {
                content: "the receipt shows the write-off label",
                trigger:
                    ".pos-receipt .receipt-write-off:contains('Extra discount'):contains('0.07')",
                isCheck: true,
            },
            {
                content: "the receipt shows one To Pay line",
                trigger: ".pos-receipt .receipt-write-off-to-pay:contains('10.00')",
                isCheck: true,
            },
            ReceiptScreen.clickNextOrder(),
            Chrome.endTour(),
        ].flat(),
});
