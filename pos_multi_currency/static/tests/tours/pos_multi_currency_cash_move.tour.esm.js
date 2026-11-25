/** @odoo-module */

import * as ProductScreen from "@point_of_sale/../tests/tours/helpers/ProductScreenTourMethods";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("PosMultiCurrencyCashMoveTour", {
    test: true,
    steps: () => [
        ...ProductScreen.confirmOpeningPopup(),
        {trigger: ".pos-topheader .menu-button"},
        {trigger: ".pos-topheader .dropdown-item:contains('Cash In/Out')"},
        {
            content: "Choose the foreign cash drawer",
            trigger: ".js_cash_move_currency",
            run: () => {
                const pos = odoo.__WOWL_DEBUG__.root.env.services.pos;
                const select = document.querySelector(".js_cash_move_currency");
                select.value = pos.foreign_currencies[0].id;
                select.dispatchEvent(new Event("change", {bubbles: true}));
            },
        },
        {
            content: "Enter a cash movement in the selected currency",
            trigger: ".cash-move-popup .input-amount input",
            run: "text 20",
        },
        {
            content: "The input and confirmation use the selected currency",
            trigger: ".cash-move-popup .confirm:not(:disabled)",
            run: () => {
                const input = document.querySelector(".cash-move-popup .input-amount");
                const confirm = document.querySelector(".cash-move-popup .confirm");
                if (!input.textContent.includes("F")) {
                    throw new Error("The cash input must show the foreign symbol F");
                }
                if (!confirm.textContent.replace(/\s/g, " ").includes("20.00 F")) {
                    throw new Error(
                        "The cash confirmation must show 20.00 F, got " +
                            confirm.textContent
                    );
                }
            },
        },
        {trigger: ".cash-move-popup .input-type:contains('Cash In')"},
        {trigger: ".cash-move-popup .confirm:not(:disabled)"},
        {
            content: "Cash in has a complete operation label and foreign amount",
            trigger: ".o_pos_notification_manager .o_notification:contains('Cash In:')",
            run: () => {
                const message = document
                    .querySelector(".o_pos_notification_manager")
                    .textContent.replace(/\s/g, " ");
                if (!message.includes("20.00 F")) {
                    throw new Error(
                        "Cash in notification uses the wrong currency: " + message
                    );
                }
            },
        },
        {trigger: ".pos-topheader .menu-button"},
        {trigger: ".pos-topheader .dropdown-item:contains('Cash In/Out')"},
        {
            content: "Choose the same drawer for cash out",
            trigger: ".js_cash_move_currency",
            run: () => {
                const pos = odoo.__WOWL_DEBUG__.root.env.services.pos;
                const select = document.querySelector(".js_cash_move_currency");
                select.value = pos.foreign_currencies[0].id;
                select.dispatchEvent(new Event("change", {bubbles: true}));
            },
        },
        {trigger: ".cash-move-popup .input-amount input", run: "text 20"},
        {trigger: ".cash-move-popup .input-type:contains('Cash Out')"},
        {trigger: ".cash-move-popup .confirm:not(:disabled)"},
        {
            content: "Cash out has a complete operation label and foreign amount",
            trigger:
                ".o_pos_notification_manager .o_notification:contains('Cash Out:')",
            run: () => {
                const message = document
                    .querySelector(".o_pos_notification_manager")
                    .textContent.replace(/\s/g, " ");
                if (!message.includes("20.00 F")) {
                    throw new Error(
                        "Cash out notification uses the wrong currency: " + message
                    );
                }
            },
        },
    ],
});
