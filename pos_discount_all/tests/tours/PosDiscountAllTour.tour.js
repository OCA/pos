/*
    Copyright (C) 2022-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
*/
/* eslint-disable no-empty-function */
odoo.define("pos_discount_all.tour.PosDiscountAllTour", function (require) {
    "use strict";

    const Tour = require("web_tour.tour");

    var steps = [
        {
            content: "Test pos_discount_all: Waiting for loading to finish",
            trigger: "body:not(:has(.loader))",
            run: () => {},
        },
        {
            content: "Test pos_discount_all: Close Opening cashbox popup",
            trigger: "div.opening-cash-control .button:contains('Open session')",
        },
        {
            content: "Test pos_discount_all: Leave category displayed by default",
            trigger: ".breadcrumb-home",
            run: () => {},
        },
        {
            content: "Test pos_discount_all: Order a 'Discount Product' (price -1.0)",
            trigger: ".product-list .product-name:contains('Discount Product')",
        },
        {
            content: "Test pos_discount_all: Check correct amount of discount value",
            trigger: ".discount-amount:contains('1.0')",
        },
        {
            content: "Test pos_discount_all: Order one 'Generic Product' (price 10.0)",
            trigger: ".product-list .product-name:contains('Generic Product')",
        },
        {
            content: "Test pos_discount_all: Change to price mode",
            trigger: ".numpad button:contains('Price')",
        },
        {
            content:
                "Test pos_discount_all: manually override the unit price of 'Generic Product' (price 5.0)",
            trigger: ".numpad button.input-button:visible:contains('5')",
        },
        {
            content: "Test pos_discount_all: Check correct amount of discount value",
            trigger: ".discount-amount:contains('6.0')",
        },
        {
            content: "Test pos_discount_all: open Pricelist popUp",
            trigger: ".control-button.o_pricelist_button",
        },
        {
            content: "Test pos_discount_all: select 'Pricelist -10%' pricelist",
            trigger: ".selection-item:contains('Pricelist -10%')",
        },
        {
            content: "Test pos_discount_all: Check correct amount of discount value",
            trigger: ".discount-amount:contains('5.90')",
        },
        {
            content: "Test pos_discount_all: Close the Point of Sale frontend",
            trigger: ".header-button",
        },
        {
            content: "Test pos_discount_all: Confirm closing the frontend",
            trigger: ".header-button",
            run: () => {},
        },
    ];

    Tour.register("PosDiscountAllTour", {test: true, url: "/pos/ui"}, steps);
});

/* */
