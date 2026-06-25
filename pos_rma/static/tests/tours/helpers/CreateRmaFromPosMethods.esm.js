/** @odoo-module **/
/*
    Copyright 2025 Antoni Marroig APSL-Nagarro (amarroig@apsl.net).
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

export function checkErrorsPopUp() {
    return [
        {
            content: "Enter invalid quantity (greater than maxqty)",
            trigger: ".rma-popup .input-group input",
            run: "text 999",
        },
        {
            content: "Try to confirm (should show ErrorPopup)",
            trigger: ".rma-popup .btn-primary",
            run: "click",
        },
        {
            content: "Wait for error message on quantity",
            trigger:
                ".popup-error .modal-body:contains('Quantity must be less than or equal of 1')",
        },
        {
            content: "Wait for error popup cancel button",
            trigger: ".popup-error .footer .cancel",
            run: "click",
        },
        {
            content: "Correct the quantity",
            trigger: ".rma-popup .input-group input",
            run: "text 1",
        },
        {
            content: "Confirm RMA",
            trigger: ".rma-popup .btn-primary",
            run: "click",
        },
        {
            content: "Wait for error message on RMA note",
            trigger:
                ".popup-error .modal-body:contains('You must add a note to the RMA')",
        },
    ];
}

export function fillRmaPopup() {
    return [
        {
            content: "Fill quantity",
            trigger: ".rma-popup .rma-qty input",
            run: "text 1",
        },
        {
            content: "Fill reason",
            trigger: ".rma-popup textarea#rmaNotes",
            run: "text Defective product",
        },
        {
            content: "Confirm RMA",
            trigger: ".rma-popup .btn-primary",
            run: "click",
        },
        {
            content: "Wait for success notification",
            trigger: ".o_notification:contains('RMA has been created')",
        },
    ];
}
