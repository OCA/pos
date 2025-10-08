import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/tours/utils/dialog_util";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("PosPartnerSaleWarning", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),
            // 1. Click on 'Customer' Button
            {
                content: "Test pos_partner_sale_warning: Click on 'Customer' Button",
                trigger: "button.set-partner",
                run: "click",
            },
            // 2. Search for the test partners
            {
                content: "Test pos_partner_sale_warning: Search for 'Test Partner'",
                trigger: ".modal-header input",
                run: "edit Test Partner",
            },
            // 3. Click the partner with the 'block' warning
            {
                content:
                    "Test pos_partner_sale_warning: Click in partner 'Test Partner #1'",
                trigger: ".partner-line:contains('Test Partner #1')",
                run: "click",
            },
            // 4. Check for the blocking warning dialog
            {
                content: "Check warning title for blocking partner",
                trigger:
                    ".modal-dialog .modal-title:contains('Warning for Test Partner #1')",
            },
            {
                content: "Check warning body for blocking partner",
                trigger:
                    ".modal-dialog .modal-body:contains('Error Message Test Message')",
            },
            // 5. Close the dialog and verify the partner was NOT set
            {
                content: "Confirm popup by clicking 'Ok'",
                trigger: ".modal-footer .btn-primary",
                run: "click",
            },
            {
                content: "Check that the partner was not selected",
                trigger: "button.set-partner:contains('Customer')",
            },
            // 6. Click the partner with the 'warning'
            {
                content: "Click on 'Test Partner #2'",
                trigger: ".partner-line:contains('Test Partner #2')",
                run: "click",
            },
            // 7. Check for the non-blocking warning dialog
            {
                content: "Check warning title for warning partner",
                trigger:
                    ".modal-dialog .modal-title:contains('Warning for Test Partner #2')",
            },
            {
                content: "Check warning body for warning partner",
                trigger:
                    ".modal-dialog .modal-body:contains('Warning Message Test Message')",
            },
            // 8. Close the dialog and verify the partner WAS set
            {
                content: "Confirm warning by clicking 'Ok'",
                trigger: ".modal-footer .btn-primary",
                run: "click",
            },
            {
                content: "Check that 'Test Partner #2' is now the selected customer",
                trigger: "button.set-partner:contains('Test Partner #2')",
            },
        ].flat(),
});
