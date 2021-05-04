/* eslint-disable */
odoo.define("pos_coupon.tour.PosCouponTourMethods", function(require) {
    "use strict";

    const {createTourMethods} = require("pos_coupon.tour.utils");
    const {
        ProductScreenDo,
        PaymentScreenDo,
        ReceiptScreenDo,
    } = require("pos_coupon.tour.PosCouponTourPosMethods");
    const ProductScreen = {do: new ProductScreenDo()};
    const PaymentScreen = {do: new PaymentScreenDo()};
    const ReceiptScreen = {do: new ReceiptScreenDo()};

    class Do {
        selectRewardLine(rewardName) {
            return [
                {
                    content: "select reward line",
                    trigger: `.orderline.program-reward .product-name:contains("${rewardName}")`,
                },
                {
                    content: "check reward line if selected",
                    trigger: `.orderline.selected.program-reward .product-name:contains("${rewardName}")`,
                    run: function() {}, // It's a check
                },
            ];
        }
        enterCode(code) {
            return [
                {
                    content: "open code input dialog",
                    trigger: '.control-button:contains("Enter Code")',
                },
                {
                    content: `enter code value: ${code}`,
                    trigger: '.popup-textinput input[type="text"]',
                    run: `text ${code}`,
                },
                {
                    content: "confirm inputted code",
                    trigger: ".popup-textinput .button.confirm",
                },
            ];
        }
        closeAlert() {
            return [
                {
                    content: "close alert",
                    trigger: ".popup-alert .button.cancel",
                },
            ];
        }
        resetActivePrograms() {
            return [
                {
                    content: "open code input dialog",
                    trigger: '.control-button:contains("Reset Programs")',
                },
            ];
        }
    }

    class Check {
        hasRewardLine(rewardName, amount) {
            return [
                {
                    content: "check if reward line is there",
                    trigger: `.orderline.program-reward span.product-name:contains("${rewardName}")`,
                    run: function() {},
                },
                {
                    content: "check if the reward price is correct",
                    trigger: `.orderline.program-reward span.price:contains("${amount}")`,
                    run: function() {},
                },
            ];
        }
        orderTotalIs(total_str) {
            return [
                {
                    content: "order total contains " + total_str,
                    trigger: '.order .total .value:contains("' + total_str + '")',
                    run: function() {}, // It's a check
                },
            ];
        }
    }

    class Execute {
        constructor() {
            this.do = new Do();
            this.check = new Check();
        }
        finalizeOrder(paymentMethod, amount) {
            return [
                ...ProductScreen.do.clickPayButton(),
                ...PaymentScreen.do.clickPaymentMethod(paymentMethod),
                ...PaymentScreen.do.pressNumpad([...amount].join(" ")),
                ...PaymentScreen.do.clickValidate(),
                ...ReceiptScreen.do.clickNextOrder(),
                ...ProductScreen.do.clickHomeCategory(),
            ];
        }
        removeRewardLine(name) {
            return [
                ...this.do.selectRewardLine(name),
                ...ProductScreen.do.pressNumpad("Backspace Backspace"),
                ...this.do.closeAlert(),
            ];
        }
    }

    return createTourMethods("PosCoupon", Do, Check, Execute);
});
