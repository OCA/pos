// Copyright 2004-2018 Odoo SA
// Copyright 2018 Lambda IS DOOEL <https://www.lambda-is.com>
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
/* eslint-disable */
odoo.define("pos_loyalty.tour.test_pos_loyalty", function(require) {
    "use strict";

    // Some of the steps are taken from the pos_basic_order tour in point_of_sale.
    // Added additional ones necessary for testing the rewards.

    var Tour = require("web_tour.tour");
    function add_customer(customer_name) {
        return [
            {
                content: "open customer screen",
                trigger: ".button.set-customer",
            },
            {
                content: "choose customer " + customer_name,
                trigger:
                    'table.client-list tbody.client-list-contents tr.client-line td:contains("' +
                    customer_name +
                    '")',
            },
            {
                content: "select customer " + customer_name,
                trigger: '.button.next:contains("Set Customer")',
            },
            {
                content: "Check if customer " + customer_name + " is added",
                trigger: '.button.set-customer:contains("' + customer_name + '")',
                run: function() {}, // It's a check
            },
        ];
    }

    function add_reward(reward_name) {
        return [
            {
                content: "open rewards screen",
                trigger: '.control-button:contains("Rewards")',
            },
            {
                content: "choose reward",
                trigger: '.selection-item:contains("' + reward_name + '")',
            },
        ];
    }

    function add_product_to_order(product_name) {
        return [
            {
                content: "buy " + product_name,
                trigger: '.product-list .product-name:contains("' + product_name + '")',
            },
            {
                content: "the " + product_name + " have been added to the order",
                trigger: '.order .product-name:contains("' + product_name + '")',
                run: function() {}, // It's a check
            },
        ];
    }

    function verify_order_product(product_name) {
        return [
            {
                content: "check if " + product_name + " is in order",
                trigger: '.orderline .product-name:contains("' + product_name + '")',
                run: function() {}, // It's a check
            },
        ];
    }

    function generate_keypad_steps(amount_str, keypad_selector) {
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
    }

    function generate_payment_screen_keypad_steps(amount_str) {
        return generate_keypad_steps(amount_str, ".payment-numpad");
    }

    function generate_product_screen_keypad_steps(amount_str) {
        return generate_keypad_steps(amount_str, ".numpad");
    }

    function verify_order_total(total_str) {
        return [
            {
                content: "order total contains " + total_str,
                trigger: '.order .total .value:contains("' + total_str + '")',
                run: function() {}, // It's a check
            },
        ];
    }

    function goto_payment_screen_and_select_payment_method() {
        return [
            {
                content: "go to payment screen",
                trigger: ".button.pay",
            },
            {
                content: "pay with cash",
                trigger: '.paymentmethod:contains("Cash")',
            },
        ];
    }

    function finish_order() {
        return [
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
                    "verify that the order has been succesfully sent to the backend",
                trigger: ".js_connected:visible",
                run: function() {}, // It's a check
            },
            {
                content: "next order",
                trigger: ".button.next:visible",
            },
        ];
    }

    var steps = [
        {
            content: "waiting for loading to finish",
            trigger: "body:has(.loader:hidden)",
            run: function() {}, // It's a check
        },
    ];

    steps = steps.concat(add_customer("Deco Addict"));
    steps = steps.concat(add_product_to_order("Letter Tray"));
    steps = steps.concat(verify_order_total("4.8"));

    steps = steps.concat(add_product_to_order("Letter Tray")); // Buy another kg of peaches
    steps = steps.concat(verify_order_total("9.6"));
    steps = steps.concat(goto_payment_screen_and_select_payment_method());
    steps = steps.concat(generate_payment_screen_keypad_steps("11.6"));

    steps = steps.concat([
        {
            content: "verify tendered",
            trigger: '.col-tendered:contains("11.60")',
            run: function() {}, // It's a check
        },
        {
            content: "verify change",
            trigger: '.col-change:contains("2.00")',
            run: function() {}, // It's a check
        },
    ]);

    steps = steps.concat(finish_order());

    Tour.register(
        "test_pos_loyalty_acquire_points",
        {
            test: true,
            url: "/pos/web",
        },
        steps
    );

    steps = [
        {
            content: "waiting for loading to finish",
            trigger: "body:has(.loader:hidden)",
            run: function() {}, // It's a check
        },
    ];
    steps = steps.concat(add_customer("Deco Addict"));
    steps = steps.concat(add_reward("Free Letter Tray"));
    steps = steps.concat(verify_order_product("Letter Tray"));
    steps = steps.concat(verify_order_total("0.00"));
    steps = steps.concat(goto_payment_screen_and_select_payment_method());
    steps = steps.concat([
        {
            content: "verify tendered",
            trigger: '.col-tendered:contains("0.00")',
            run: function() {}, // It's a check
        },
    ]);
    steps = steps.concat(finish_order());

    Tour.register(
        "test_pos_loyalty_spend_points",
        {
            test: true,
            url: "/pos/web",
        },
        steps
    );
});
