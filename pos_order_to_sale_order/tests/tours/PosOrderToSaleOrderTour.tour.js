/*
    Copyright (C) 2022-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
*/
odoo.define("pos_order_to_sale_order.tour.PosOrderToSaleOrderTour", function (require) {
    "use strict";

    const Tour = require("web_tour.tour");

    var steps = [
        {
            content: "Test pos_order_to_sale_order: Waiting for loading to finish",
            trigger: "body:not(:has(.loader))",
            // eslint-disable-next-line no-empty-function
            run: () => {},
        },
        {
            content: "Test pos_order_to_sale_order: Close Opening cashbox popup",
            trigger: "div.opening-cash-control .button:contains('Open session')",
        },
        {
            content:
                "Test pos_order_to_sale_order: Leave category displayed by default",
            trigger: ".breadcrumb-home",
            // eslint-disable-next-line no-empty-function
            run: () => {},
        },
        {
            content:
                "Test pos_order_to_sale_order: Order a 'Whiteboard Pen' (price 3.20)",
            trigger: ".product-list .product-name:contains('Whiteboard Pen')",
        },
        {
            content: "Test pos_order_to_sale_order: Click on 'Customer' Button",
            trigger: "button.set-partner",
        },
        {
            content: "Test pos_order_to_sale_order: Select a customer 'Addison Olson'",
            trigger: "tr.partner-line td div:contains('Addison Olson')",
        },
        {
            content: "Test pos_order_to_sale_order: Click on 'Create Order' Button",
            trigger: "span.control-button span:contains('Create Order')",
        },
        {
            content:
                "Test pos_order_to_sale_order: Click on 'Create invoiced order' Button",
            trigger:
                "div.button-sale-order span:contains('Create Invoiced Sale Order')",
        },
        {
            content: "Test pos_order_to_sale_order: Close the Point of Sale frontend",
            trigger: ".header-button",
        },
        {
            content: "Test pos_order_to_sale_order: Confirm closing the frontend",
            trigger: ".header-button",
            // eslint-disable-next-line no-empty-function
            run: () => {},
        },
    ];

    Tour.register("PosOrderToSaleOrderTour", {test: true, url: "/pos/ui"}, steps);
});

/* */
