/** @odoo-module **/
/*
    Copyright 2024 Camptocamp SA (https://www.camptocamp.com).
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

export function clickCreateOrderButton() {
    return [
        {
            content: "Click on 'Create Order' Button",
            trigger: ".control-buttons .control-button:contains('Create Order')",
        },
    ];
}

export function clickCreateInvoicedOrderButton() {
    return [
        {
            content: "Click on 'Create invoiced order' Button",
            trigger:
                ".popup-create-sale-order .button-sale-order span:contains('Create Invoiced Sale Order')",
        },
    ];
}
