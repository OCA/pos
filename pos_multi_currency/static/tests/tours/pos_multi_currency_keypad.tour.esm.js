/** @odoo-module */

import * as PaymentScreen from "@point_of_sale/../tests/tours/helpers/PaymentScreenTourMethods";
import * as ProductScreen from "@point_of_sale/../tests/tours/helpers/ProductScreenTourMethods";
import {registry} from "@web/core/registry";

function clickNumpad(label) {
    return {
        content: "Press " + label,
        trigger: "div.numpad.row button.col:contains('" + label + "')",
        run: () => {
            const button = [
                ...document.querySelectorAll("div.numpad.row button.col"),
            ].find((el) => el.innerHTML === label);
            button.click();
            odoo.__WOWL_DEBUG__.root.env.services.number_buffer.capture();
        },
    };
}

registry.category("web_tour.tours").add("PosMultiCurrencyCommaDecimalTour", {
    test: true,
    steps: () => [
        {
            content: "Foreign opening count is shown",
            trigger: ".opening-cash-control .foreign-opening",
        },
        {
            // The button label is translated. Italian is the language under test.
            content: "Open the session",
            trigger: ".opening-cash-control footer button.btn-primary:not(:disabled)",
        },
        {
            content: "Search the foreign tender product",
            trigger: ".products-widget-control input",
            run: "text Foreign tender product",
        },
        ...ProductScreen.clickDisplayedProduct("Foreign tender product"),
        ...ProductScreen.clickPayButton(),
        ...PaymentScreen.clickPaymentMethod("Cash"),
        {
            content: "Open the currency popup",
            trigger: ".js_foreign_currency:not(:disabled)",
        },
        {
            content: "Type a foreign amount that has decimals",
            trigger: ".js_foreign_amount",
            run: () => {
                const input = document.querySelector(".js_foreign_amount");
                input.value = "48,35";
                input.dispatchEvent(new Event("input", {bubbles: true}));
            },
        },
        {
            content: "Apply the decimal tender",
            trigger: ".foreign-currency-popup .confirm:not(:disabled)",
        },
        {
            content: "The keypad keeps the comma as the decimal point",
            trigger: ".paymentline.selected .foreign-payment",
            run: () => {
                const buffer =
                    odoo.__WOWL_DEBUG__.root.env.services.number_buffer.get();
                const line =
                    odoo.__WOWL_DEBUG__.root.env.services.pos.get_order()
                        .selected_paymentline;
                if (buffer !== "48,35") {
                    throw new Error("keypad should show 48,35, got " + buffer);
                }
                if (Math.abs(line.foreign_amount - 48.35) > 0.001) {
                    throw new Error(
                        "foreign amount should be 48.35, got " + line.foreign_amount
                    );
                }
            },
        },
        clickNumpad("+10"),
        {
            content: "+10 adds ten, and the dot in the sum is a decimal point",
            trigger: ".paymentline.selected .foreign-payment",
            run: () => {
                const line =
                    odoo.__WOWL_DEBUG__.root.env.services.pos.get_order()
                        .selected_paymentline;
                if (Math.abs(line.foreign_amount - 58.35) > 0.001) {
                    throw new Error(
                        "+10 should make 58.35 of the foreign currency, got " +
                            line.foreign_amount
                    );
                }
            },
        },
        clickNumpad("+10"),
        {
            content: "A second increment still uses the locale decimal separator",
            trigger: ".paymentline.selected .foreign-payment",
            run: () => {
                const services = odoo.__WOWL_DEBUG__.root.env.services;
                const line = services.pos.get_order().selected_paymentline;
                if (Math.abs(line.foreign_amount - 68.35) > 0.001) {
                    throw new Error(
                        "Two increments should make 68.35, got " + line.foreign_amount
                    );
                }
                if (services.number_buffer.get() !== "68,35") {
                    throw new Error("The keypad lost its comma decimal separator");
                }
            },
        },
    ],
});

registry.category("web_tour.tours").add("PosMultiCurrencyCashRoundingTour", {
    test: true,
    steps: () => [
        {
            content: "Foreign opening count is shown",
            trigger: ".opening-cash-control .foreign-opening",
        },
        ...ProductScreen.confirmOpeningPopup(),
        {
            content: "Search the rounding product",
            trigger: ".products-widget-control input",
            run: "text Rounding tender product",
        },
        ...ProductScreen.clickDisplayedProduct("Rounding tender product"),
        ...ProductScreen.clickPayButton(),
        ...PaymentScreen.clickPaymentMethod("Cash"),
        ...PaymentScreen.selectedPaymentlineHas("Cash", "10.05"),
        {
            content: "Open the currency popup on the rounded cash line",
            trigger: ".js_foreign_currency:not(:disabled)",
        },
        {
            content: "Amount received is the foreign amount due",
            trigger: ".js_foreign_amount",
            run: () => {
                const pos = odoo.__WOWL_DEBUG__.root.env.services.pos;
                const order = pos.get_order();
                const line = order.selected_paymentline;
                const currency = pos.foreign_currencies.find(
                    (item) => item.name === "F"
                );
                const due = order.getForeignDue(currency, line);
                const shown = Number(
                    document
                        .querySelector(".js_foreign_amount")
                        .value.replace(/[^\d.-]/g, "")
                );
                if (Math.abs(shown - due) > 0.001) {
                    throw new Error(
                        "amount received should be the foreign due " +
                            due +
                            ", got " +
                            shown
                    );
                }
                if (Math.abs(shown - line.get_amount()) < 0.001) {
                    throw new Error(
                        "amount received used the rounded Point of Sale amount " + shown
                    );
                }
            },
        },
    ],
});
