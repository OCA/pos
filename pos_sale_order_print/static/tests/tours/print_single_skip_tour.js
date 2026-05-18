/** @odoo-module **/

import {ErrorPopup} from "point_of_sale.tour.ErrorPopupTourMethods";
import {getSteps, startSteps} from "point_of_sale.tour.utils";
import {ProductScreen} from "pos_sale.tour.ProductScreenTourMethods";
import {SelectionPopup} from "point_of_sale.tour.SelectionPopupTourMethods";
import tour from "web_tour.tour";

// Tour 1 — 1 inform configured, direct action
startSteps();

ProductScreen.do.confirmOpeningPopup();
getSteps().push({
    content: "Click Quotation/Order button to open SaleOrderManagementScreen",
    trigger: ".control-button.o_sale_order_button",
    timeout: 2000,
    run: "click",
});

getSteps().push({
    content: "Select first sale order from SaleOrderManagementScreen",
    trigger: ".order-management-screen .order-list .order-row:first",
    run: "click",
});
getSteps().push({
    content: "Wait until popup selection is loaded",
    trigger: ".modal-dialog .popup-selection",
    timeout: 5000,
    // eslint-disable-next-line no-empty-function
    run: () => {},
});
getSteps().push({
    content: "Click Print option",
    trigger:
        ".modal-dialog .popup-selection .selection-item:contains('Print')",
    run: "click",
});
getSteps().push({
    content: "Assert SelectionPopup is NOT shown (do_action invoked directly)",
    trigger: ".order-management-screen",
    run: function () {
        const popup = document.querySelector(".modal-dialog .popup-selection");
        if (popup) {
            throw new Error(
                "SelectionPopup MUST NOT render when only one report is configured"
            );
        }
    },
});

tour.register(
    "print_single_report_direct_action_tour_oca",
    {test: true, url: "/pos/ui"},
    getSteps()
);

// Tour 2 — 2 informs configured, SelectionPopup
startSteps();
ProductScreen.do.confirmOpeningPopup();
getSteps().push({
    content: "Click Quotation/Order button to open SaleOrderManagementScreen",
    trigger: ".control-button.o_sale_order_button",
    run: "click",
});

getSteps().push({
    content: "Select first sale order from SaleOrderManagementScreen",
    trigger: ".order-management-screen .order-list .order-row:first",
    run: "click",
});
getSteps().push({
    content: "Wait until popup selection is loaded",
    trigger: ".modal-dialog .popup-selection",
    timeout: 5000,
    // eslint-disable-next-line no-empty-function
    run: () => {},
});
getSteps().push({
    content: "Click Print option",
    trigger:
        ".modal-dialog .popup-selection .selection-item:contains('Print')",
    run: "click",
});

SelectionPopup.check.isShown();
SelectionPopup.check.hasSelectionItem("Test Report A");
SelectionPopup.check.hasSelectionItem("Test Report B");
SelectionPopup.do.clickItem("Test Report B");

tour.register(
    "print_multi_report_selection_tour_oca",
    {test: true, url: "/pos/ui"},
    getSteps()
);

// Tour 3 — 0 informs configured, ErrorPopup
startSteps();

ProductScreen.do.confirmOpeningPopup();
getSteps().push({
    content: "Click Quotation/Order button to open SaleOrderManagementScreen",
    trigger: ".control-button.o_sale_order_button",
    timeout: 2000,
    run: "click",
});

getSteps().push({
    content: "Select first sale order from SaleOrderManagementScreen",
    trigger: ".order-management-screen .order-list .order-row:first",
    run: "click",
});
getSteps().push({
    content: "Wait until popup selection is loaded",
    trigger: ".modal-dialog .popup-selection",
    timeout: 5000,
    // eslint-disable-next-line no-empty-function
    run: () => {},
});
getSteps().push({
    content: "Click Print option",
    trigger:
        ".modal-dialog .popup-selection .selection-item:contains('Print')",
    run: "click",
});
ErrorPopup.check.isShown();

tour.register(
    "print_no_reports_error_popup_tour_oca",
    {test: true, url: "/pos/ui"},
    getSteps()
);
