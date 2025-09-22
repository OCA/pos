/** @odoo-module */
import {registry} from "@web/core/registry";

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
        content: "Test pos_partner_sale_warning: Open menu Point of Sale",
        trigger: "div.navbar-button.menu-button",
        run: "click",
    },
    {
        content:
            "Test pos_partner_sale_warning: Open modal confirm closing Point of Sale",
        trigger: "li.close-button",
        run: "click",
    },
    {
        content: "Test pos_partner_sale_warning: Confirm closing the frontend",
        extra_trigger: "div.popup.close-pos-popup",
        trigger: "button.button.highlight",
        run: "click",
    },
];

registry.category("web_tour.tours").add("PosPartnerSaleWarning", {
    test: true,
    url: "/pos/ui",
    steps: () =>
        [
            ...startSteps,
            {
                content: "Test pos_partner_sale_warning: Click in partner",
                trigger: "tr.partner-line:has(td b:contains('Test Partner #1'))",
                run: "click",
            },
            {
                content: "Test pos_partner_sale_warning: Check warning text",
                extra_trigger: ".modal-dialog",
                trigger: ".modal-dialog .title:contains('Warning for Test Partner #1')",
            },
            {
                content: "Test pos_partner_sale_warning: Check warning text",
                extra_trigger: ".modal-dialog",
                trigger: "main.modal-body:contains('Error Message Test Message')",
                // eslint-disable-next-line no-empty-function
                run: () => {},
            },
            {
                content:
                    "Test pos_partner_sale_warning: Confirm popup click on 'Ok' Button",
                trigger: ".modal-dialog .modal-footer .button:contains('Ok')",
                run: "click",
            },
            {
                content: "Test pos_partner_sale_warning: Click on 'Test Partner #2'",
                trigger: "tr.partner-line:has(td b:contains('Test Partner #2'))",
                run: "click",
            },
            {
                content: "Test pos_partner_sale_warning: Check warning text",
                extra_trigger: ".modal-dialog",
                trigger: ".modal-dialog .title:contains('Warning for Test Partner #2')",
                // eslint-disable-next-line no-empty-function
                run: () => {},
            },
            {
                content: "Test pos_partner_sale_warning: Check warning text",
                extra_trigger: ".modal-dialog",
                trigger: "main.modal-body:contains('Warning Message Test Message')",
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
        ].flat(),
});
