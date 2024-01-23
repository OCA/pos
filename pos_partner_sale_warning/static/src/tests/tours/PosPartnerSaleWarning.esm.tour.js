odoo.define("pos_partner_sale_warning.PosPartnerSaleWarning", function (require) {
    "use strict";

    const Tour = require("web_tour.tour");

    const startSteps = [
        {
            content: "Test pos_partner_sale_warning: Waiting for loading to finish",
            trigger: "body:not(:has(.loader))",
            // eslint-disable-next-line no-empty-function
            run: () => {},
        },
        {
            content: "Test pos_partner_sale_warning: Close Opening cashbox popup",
            trigger: "div.opening-cash-control .button:contains('Open session')",
        },
        {
            content: "Test pos_partner_sale_warning: Click on 'Customer' Button",
            trigger: "button.set-partner",
        },
        {
            content: "Test pos_partner_sale_warning: Search partner 'Test Partner #1'",
            trigger: ".pos-search-bar input",
            run: "text 'Test Partner'",
        },
    ];

    const endSteps = [
        {
            content: "Test pos_partner_sale_warning: Close the Point of Sale frontend",
            trigger: ".header-button",
        },
        {
            content: "Test pos_partner_sale_warning: Confirm closing the frontend",
            trigger: ".header-button",
            // eslint-disable-next-line no-empty-function
            run: () => {},
        },
    ];

    Tour.register("PosPartnerSaleWarning", {test: true, url: "/pos/ui"}, [
        ...startSteps,
        {
            content: "Test pos_partner_sale_warning: Click in partner",
            trigger: "tr.partner-line td div:contains('Test Partner #1')",
        },
        {
            content: "Test pos_partner_sale_warning: Check warning text",
            trigger: ".modal-dialog .title:contains('Warning for Test Partner #1')",
            // eslint-disable-next-line no-empty-function
            run: () => {},
        },
        {
            content: "Test pos_partner_sale_warning: Check warning text",
            trigger: ".modal-dialog .body:contains('Error Message Test Message')",
            // eslint-disable-next-line no-empty-function
            run: () => {},
        },
        {
            content:
                "Test pos_partner_sale_warning: Confirm popup click on 'Ok' Button",
            trigger: ".modal-dialog .cancel",
        },
        {
            content: "Test pos_partner_sale_warning: Click on 'Test Partner #2'",
            trigger: "tr.partner-line td div:contains('Test Partner #2')",
        },
        {
            content: "Test pos_partner_sale_warning: Check warning text",
            trigger: ".modal-dialog .title:contains('Warning for Test Partner #2')",
            // eslint-disable-next-line no-empty-function
            run: () => {},
        },
        {
            content: "Test pos_partner_sale_warning: Check warning text",
            trigger: ".modal-dialog .body:contains('Warning Message Test Message')",
            // eslint-disable-next-line no-empty-function
            run: () => {},
        },
        {
            content: "Test pos_partner_sale_warning: Click on 'Customer' Button",
            trigger: "button.set-partner:contains('Test Partner #2')",
            // eslint-disable-next-line no-empty-function
            run: () => {},
        },
        ...endSteps,
    ]);
});
