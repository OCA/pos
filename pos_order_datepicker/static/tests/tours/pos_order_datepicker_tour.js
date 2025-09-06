/** @odoo-module **/
/* eslint-env browser */

import {registry} from "@web/core/registry";
import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/tours/utils/dialog_util";

registry.category("web_tour.tours").add("PosOrderDatepickerTour", {
    steps: () => [
        Chrome.startPoS(),
        Dialog.confirm("Open Register"),
        Chrome.clickMenuOption("Orders"),
        {
            content: "Open the datepicker filter",
            trigger: "#datepicker-icon",
            run: "click",
        },
        {
            content: "Select today's date",
            trigger: ".date-picker-input",
            run: async () => {
                const today = new Date().toISOString().split("T")[0];
                const dateInput = document.querySelector(".date-picker-input");
                dateInput.value = today;
                dateInput.dispatchEvent(new window.Event("change", {bubbles: true}));
            },
        },
        {
            content: "Verify at least one order is visible",
            trigger: ".order-row",
            run: async () => {
                const orders = document.querySelectorAll(".order-row");
                if (orders.length === 0) {
                    throw new Error("No orders found for the selected date!");
                }
            },
        },
    ],
});
