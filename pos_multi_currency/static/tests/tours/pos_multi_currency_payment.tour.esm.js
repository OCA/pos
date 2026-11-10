/** @odoo-module */

import * as Chrome from "@point_of_sale/../tests/tours/helpers/ChromeTourMethods";
import * as PaymentScreen from "@point_of_sale/../tests/tours/helpers/PaymentScreenTourMethods";
import * as ProductScreen from "@point_of_sale/../tests/tours/helpers/ProductScreenTourMethods";
import * as TicketScreen from "@point_of_sale/../tests/tours/helpers/TicketScreenTourMethods";
import {registry} from "@web/core/registry";
import {roundDecimals as round_di} from "@web/core/utils/numbers";

registry.category("web_tour.tours").add("PosMultiCurrencyPaymentTour", {
    test: true,
    steps: () =>
        [
            {
                content: "Foreign opening count is shown",
                trigger: ".opening-cash-control .foreign-opening",
            },
            ProductScreen.confirmOpeningPopup(),
            {
                content: "Search the foreign tender product",
                trigger: ".products-widget-control input",
                run: "text Foreign tender product",
            },
            ProductScreen.clickDisplayedProduct("Foreign tender product"),
            ProductScreen.clickPayButton(),
            PaymentScreen.clickPaymentMethod("Cash"),
            // Two digits only. A faster burst is dropped by the payment
            // numpad, which treats three quick keys as a barcode.
            // 30, not 20: the due is 220.00, and a :contains("20.00")
            // check matches that before the keypad has applied the keys.
            ...PaymentScreen.enterPaymentLineAmount("Cash", "30"),
            ...PaymentScreen.selectedPaymentlineHas("Cash", "30.00"),
            {
                content: "Open the currency popup on the typed tender",
                trigger: ".js_foreign_currency:not(:disabled)",
            },
            {
                content: "Amount received is the typed 30 in the foreign currency",
                trigger: ".js_foreign_amount",
                run: () => {
                    const pos = odoo.__WOWL_DEBUG__.root.env.services.pos;
                    const currency = pos.foreign_currencies.find(
                        (item) => item.name === "F"
                    );
                    const shown = Number(
                        document
                            .querySelector(".js_foreign_amount")
                            .value.replace(/[^\d.-]/g, "")
                    );
                    const converted = round_di(
                        30 * currency.rate,
                        currency.decimal_places
                    );
                    if (Math.abs(shown - 30) > 0.001) {
                        throw new Error(
                            "Amount received should be the typed 30, got " + shown
                        );
                    }
                    if (Math.abs(shown - converted) < 0.001) {
                        throw new Error(
                            "Amount received converted 30 from the Point of Sale currency"
                        );
                    }
                    const equivalent = Number(
                        document
                            .querySelector(".js_pos_equivalent")
                            .textContent.replace(/[^\d.-]/g, "")
                    );
                    const posAmount = round_di(
                        30 / currency.rate,
                        pos.currency.decimal_places
                    );
                    if (Math.abs(equivalent - posAmount) > 0.001) {
                        throw new Error(
                            "Point of Sale amount should be " +
                                posAmount +
                                ", got " +
                                equivalent
                        );
                    }
                },
            },
            {
                content: "Apply the typed tender",
                trigger: ".foreign-currency-popup .confirm:not(:disabled)",
            },
            {
                content:
                    "The selected foreign tender shows both currencies and the remainder",
                trigger: ".paymentline.selected .foreign-payment",
                run: () => {
                    const pos = odoo.__WOWL_DEBUG__.root.env.services.pos;
                    const amount = document.querySelector(
                        ".paymentline.selected .payment-amount"
                    ).textContent;
                    if (!amount.includes(pos.currency.symbol)) {
                        throw new Error("The Point of Sale currency symbol is missing");
                    }
                    const remaining = document.querySelector(".foreign-remaining");
                    if (!remaining || !remaining.textContent.includes("20.00")) {
                        throw new Error("The remaining 20.00 F is missing");
                    }
                },
            },
            {
                content: "A digit starts a new foreign amount",
                trigger: "div.numpad.row button.col:contains('4')",
                run: () => {
                    const button = [
                        ...document.querySelectorAll("div.numpad.row button.col"),
                    ].find((el) => el.innerHTML === "4");
                    button.click();
                    odoo.__WOWL_DEBUG__.root.env.services.number_buffer.capture();
                },
            },
            {
                content: "The next digit continues the new foreign amount",
                trigger: "div.numpad.row button.col:contains('0')",
                run: () => {
                    const button = [
                        ...document.querySelectorAll("div.numpad.row button.col"),
                    ].find((el) => el.innerHTML === "0");
                    button.click();
                    odoo.__WOWL_DEBUG__.root.env.services.number_buffer.capture();
                },
            },
            {
                content: "Typing 4,0 replaces the foreign amount with 40",
                trigger: ".paymentline.selected .foreign-payment",
                run: () => {
                    const pos = odoo.__WOWL_DEBUG__.root.env.services.pos;
                    const line = pos.get_order().selected_paymentline;
                    if (Math.abs(line.foreign_amount - 40) > 0.001) {
                        throw new Error(
                            "typing 4,0 should set 40, got " + line.foreign_amount
                        );
                    }
                },
            },
            {
                content: "Add 10 of the foreign currency",
                trigger: "div.numpad.row button.col:contains('+10')",
                run: () => {
                    const button = [
                        ...document.querySelectorAll("div.numpad.row button.col"),
                    ].find((el) => el.innerHTML === "+10");
                    button.click();
                    // The keypad applies the key on a short timer. Flush it
                    // before the next step reads the line.
                    odoo.__WOWL_DEBUG__.root.env.services.number_buffer.capture();
                },
            },
            {
                content: "+10 adds ten to the typed foreign amount",
                trigger: ".paymentline.selected .foreign-payment",
                run: () => {
                    const pos = odoo.__WOWL_DEBUG__.root.env.services.pos;
                    const line = pos.get_order().selected_paymentline;
                    const currency = pos.foreignCurrencyById[line.foreign_currency_id];
                    const posAmount = round_di(
                        50 / currency.rate,
                        pos.currency.decimal_places
                    );
                    if (Math.abs(line.foreign_amount - 50) > 0.001) {
                        throw new Error(
                            "+10 should make 50 of the foreign currency, got " +
                                line.foreign_amount
                        );
                    }
                    if (Math.abs(line.get_amount() - posAmount) > 0.001) {
                        throw new Error(
                            "Point of Sale amount should be " +
                                posAmount +
                                ", got " +
                                line.get_amount()
                        );
                    }
                },
            },
            {
                content: "Open the currency popup to drop the currency",
                trigger: ".js_foreign_currency:not(:disabled)",
            },
            {
                content: "Use the Point of Sale currency",
                trigger: ".foreign-currency-popup .js_use_pos_currency",
            },
            {
                content: "A digit replaces the Point of Sale amount",
                trigger: "div.numpad.row button.col:contains('5')",
                run: () => {
                    const button = [
                        ...document.querySelectorAll("div.numpad.row button.col"),
                    ].find((el) => el.innerHTML === "5");
                    button.click();
                    odoo.__WOWL_DEBUG__.root.env.services.number_buffer.capture();
                },
            },
            {
                content: "The digit set a new Point of Sale amount",
                trigger: ".paymentline.selected .payment-amount",
                run: () => {
                    const pos = odoo.__WOWL_DEBUG__.root.env.services.pos;
                    const line = pos.get_order().selected_paymentline;
                    if (line.foreign_currency_id) {
                        throw new Error("the foreign currency is still on the line");
                    }
                    if (Math.abs(line.get_amount() - 5) > 0.001) {
                        throw new Error(
                            "expected 5 after the digit, got " + line.get_amount()
                        );
                    }
                },
            },
            {
                content: "Remove the partial tender",
                trigger: ".paymentline.selected .delete-button",
            },
            ...PaymentScreen.clickPaymentMethod("Cash"),
            {
                content: "Open the currency popup",
                trigger: ".js_foreign_currency:not(:disabled)",
            },
            {
                content: "The rate is foreign units per one Point of Sale unit",
                trigger: ".foreign-rate-label:contains('0.227273')",
            },
            {
                content: "Choose F",
                trigger: ".js_select_foreign_currency[data-currency='F']",
            },
            {
                content: "The amount received starts as the foreign due",
                trigger: ".js_foreign_amount",
                run: () => {
                    const input = document.querySelector(".js_foreign_amount");
                    const value = Number(input.value.replace(/,/g, ""));
                    if (value !== 50) {
                        throw new Error(
                            "Amount received should start as the amount due, got " +
                                input.value
                        );
                    }
                },
            },
            {
                content: "Apply the proposed tender",
                trigger: ".foreign-currency-popup .confirm:not(:disabled)",
            },
            {
                content:
                    "The line shows the foreign amount and the Point of Sale amount",
                trigger: ".paymentline.selected .foreign-payment",
                run: () => {
                    const line = document.querySelector(".paymentline.selected");
                    const foreign = line
                        .querySelector(".foreign-payment")
                        .textContent.replace(/,/g, "");
                    const posAmount = line
                        .querySelector(".payment-amount")
                        .textContent.replace(/,/g, "");
                    if (!foreign.includes("50")) {
                        throw new Error("foreign amount is " + foreign);
                    }
                    if (!posAmount.includes("220")) {
                        throw new Error("Point of Sale amount is " + posAmount);
                    }
                },
            },
            {
                content: "Rebuilding the payment from JSON keeps the foreign tender",
                trigger: ".paymentline .foreign-payment:contains('F')",
                run: () => {
                    const pos = odoo.__WOWL_DEBUG__.root.env.services.pos;
                    const order = pos.get_order();
                    const line = order.get_paymentlines()[0];
                    const json = line.export_as_JSON();
                    if (!json.foreign_currency_id || !json.amount_currency) {
                        throw new Error("export_as_JSON dropped the foreign tender");
                    }
                    const restored = new line.constructor(
                        {cid: "foreign-restore-test"},
                        {pos, order, json}
                    );
                    if (restored.foreign_currency_id !== json.foreign_currency_id) {
                        throw new Error(
                            "foreign_currency_id was wiped when rebuilt from JSON"
                        );
                    }
                    if (restored.foreign_amount !== json.amount_currency) {
                        throw new Error(
                            "foreign_amount was wiped when rebuilt from JSON"
                        );
                    }
                    if (restored.foreign_currency_rate !== json.foreign_currency_rate) {
                        throw new Error(
                            "foreign_currency_rate was wiped when rebuilt from JSON"
                        );
                    }
                },
            },
            ...PaymentScreen.clickValidate(),
            {
                content: "Receipt shows the tender rate",
                trigger: ".pos-receipt .pos-receipt-foreign:contains('0.227273')",
            },
            ...Chrome.clickMenuButton(),
            ...Chrome.clickTicketButton(),
            ...TicketScreen.selectFilter("Paid"),
            {trigger: ".ticket-screen .order-row"},
            ...TicketScreen.clickControlButton("Print Receipt"),
            {
                content: "Reprinting a paid order preserves the foreign tender",
                trigger: ".receipt-screen .pos-receipt-foreign:contains('0.227273')",
                isCheck: true,
            },
        ].flat(),
});
