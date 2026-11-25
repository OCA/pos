/** @odoo-module */

import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("PosMultiCurrencyBackendRefundTour", {
    test: true,
    steps: () => [
        {
            content: "Pay the newly created backend refund order",
            trigger: ".o_form_view button:contains('Payment')",
        },
        {
            content: "The Payment action opens the Pay Order wizard",
            trigger: "button[name='check']",
            run: () => {
                const field = document.querySelector(
                    ".modal .o_field_widget[name='amount']"
                );
                const amount = field.querySelector("input")?.value || field.textContent;
                if (Number(amount.replace(/,/g, "")) !== -220) {
                    throw new Error("The refund amount should be -220, got " + amount);
                }
            },
        },
        {trigger: "button[name='check']"},
        {
            content: "The refund is paid and the wizard closes",
            trigger:
                ".o_form_view .o_statusbar_status button[data-value='paid'].o_arrow_button_current",
            extra_trigger: "body:not(:has(.modal))",
            isCheck: true,
        },
    ],
});
