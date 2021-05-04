/* eslint-disable */
odoo.define("pos_coupon.tour.PosCouponTourPosMethods", function(require) {
    "use strict";

    const {createTourMethods} = require("pos_coupon.tour.utils");

    class ProductScreenDo {
        clickHomeCategory() {
            return [
                {
                    content: "click Home subcategory",
                    trigger: ".js-category-switch",
                },
            ];
        }
        clickPayButton() {
            return [
                {content: "click pay button", trigger: ".actionpad .button.pay"},
                {
                    content: "now in payment screen",
                    trigger: ".pos-content .payment-screen",
                    run: () => {},
                },
            ];
        }
        pressNumpad(keys) {
            const numberChars = ". 0 1 2 3 4 5 6 7 8 9".split(" ");
            const modeButtons = "Qty Price Disc".split(" ");
            function generateStep(key) {
                let trigger;
                if (numberChars.includes(key)) {
                    trigger = `.numpad .number-char:contains("${key}")`;
                } else if (modeButtons.includes(key)) {
                    trigger = `.numpad .mode-button:contains("${key}")`;
                } else if (key === "Backspace") {
                    trigger = `.numpad .numpad-backspace`;
                } else if (key === "+/-") {
                    trigger = `.numpad .numpad-minus`;
                }
                return {
                    content: `'${key}' pressed in product screen numpad`,
                    trigger,
                };
            }
            return keys.split(" ").map(generateStep);
        }
        clickDisplayedProduct(name) {
            return [
                {
                    content: `click product '${name}'`,
                    trigger: `.product-list .product-name:contains("${name}")`,
                },
            ];
        }
    }

    class ProductScreenExecute {
        /* Simplified version of what's found in core */
        addOrderline(productName, quantity) {
            const res = this._do.clickDisplayedProduct(productName);
            for (const char of quantity.toString()) {
                if (".0123456789".includes(char)) {
                    res.push(...this._do.pressNumpad(char));
                } else if ("-".includes(char)) {
                    res.push(...this._do.pressNumpad("+/-"));
                }
            }
            return res;
        }
    }

    class PaymentScreenDo {
        clickPaymentMethod(name) {
            return [
                {
                    content: `click '${name}' payment method`,
                    trigger: `.paymentmethods .button.paymentmethod:contains("${name}")`,
                },
            ];
        }
        clickValidate() {
            return [
                {
                    content: "validate payment",
                    trigger: `.payment-screen .button.next.highlight`,
                },
            ];
        }
        pressNumpad(keys) {
            const numberChars = ". +/- 0 1 2 3 4 5 6 7 8 9".split(" ");
            const modeButtons = "+10 +20 +50".split(" ");
            function generateStep(key) {
                let trigger;
                if (numberChars.includes(key)) {
                    trigger = `.payment-numpad .number-char:contains("${key}")`;
                } else if (modeButtons.includes(key)) {
                    trigger = `.payment-numpad .mode-button:contains("${key}")`;
                } else if (key === "Backspace") {
                    trigger = `.payment-numpad .number-char img[alt="Backspace"]`;
                }
                return {
                    content: `'${key}' pressed in payment numpad`,
                    trigger,
                };
            }
            return keys.split(" ").map(generateStep);
        }
    }

    class ReceiptScreenDo {
        clickNextOrder() {
            return [
                {
                    content: "go to next screen",
                    trigger: ".receipt-screen .button.next.highlight",
                },
            ];
        }
    }

    return {ProductScreenDo, ProductScreenExecute, PaymentScreenDo, ReceiptScreenDo};
});
