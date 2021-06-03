/*
Copyright 2021 Camptocamp SA - Iván Todorovich
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/
/* eslint-disable */
odoo.define("pos_event_sale.tour_utils", function(require) {
    "use strict";

    const tour_utils = {
        startSteps: function() {
            return [
                {
                    content: "wait for loading to finish",
                    trigger: "body:has(.loader:hidden)",
                    run: function() {}, // It's a check
                },
            ];
        },

        clickHomeCategory: function() {
            return [
                {
                    content: "click Home subcategory",
                    trigger: ".js-category-switch",
                },
            ];
        },

        clickProduct: function(productName) {
            return [
                {
                    content: `click product '${productName}'`,
                    trigger: `.product-list .product-name:contains('${productName}')`,
                },
            ];
        },

        clickEvent: function(eventName) {
            return [
                {
                    content: `click event '${eventName}'`,
                    trigger: `.popup-event-selector .event-name:contains('${eventName}')`,
                },
            ];
        },

        clickEventTicket: function(eventTicketName) {
            return [
                {
                    content: `click event ticket '${eventTicketName}'`,
                    trigger: `.popup-event-tickets .ticket-name:contains('${eventTicketName}')`,
                },
            ];
        },

        closePopup: function() {
            return [
                {
                    content: "click Close button",
                    trigger: ".popup .button.cancel",
                },
            ];
        },

        generate_keypad_steps: function(amount_str, keypad_selector) {
            var i,
                steps = [],
                current_char;
            for (i = 0; i < amount_str.length; ++i) {
                current_char = amount_str[i];
                steps.push({
                    content: "press " + current_char + " on payment keypad",
                    trigger:
                        keypad_selector +
                        ' .input-button:contains("' +
                        current_char +
                        '"):visible',
                });
            }
            return steps;
        },

        verifyOrderTotal: function(amount) {
            return [
                {
                    content: `order total contains ${amount}`,
                    trigger: `.order .total .value:contains("${amount}")`,
                    run: function() {}, // It's a check
                },
            ];
        },

        finishOrder: function(paymentMethod, amount) {
            return [
                // Go to Payment Screen and Select payment method
                {
                    content: "go to payment screen",
                    trigger: ".actionpad .button.pay",
                },
                {
                    content: "now in payment screen",
                    trigger: ".pos-content .payment-screen",
                    run: () => {},
                },
                {
                    content: `Pay with '${paymentMethod}'`,
                    trigger: `.paymentmethod:contains("${paymentMethod}")`,
                },
                // Enter amount
                ...this.generate_keypad_steps(amount, ".payment-numpad"),
                // Validate
                {
                    content: "validate the order",
                    trigger: ".button.next:visible",
                },
                {
                    content: "verify that the order is being sent to the backend",
                    trigger: ".js_connecting:visible",
                    run: function() {}, // It's a check
                },
                {
                    content:
                        "verify that the order has been successfully sent to the backend",
                    trigger: ".js_connected:visible",
                    run: function() {}, // It's a check
                },
                {
                    content: "next order",
                    trigger: ".button.next:visible",
                },
                // Leave category displayed by default
                {
                    content: "click category switch",
                    trigger: ".js-category-switch",
                    run: "click",
                },
            ];
        },
    };

    return tour_utils;
});
