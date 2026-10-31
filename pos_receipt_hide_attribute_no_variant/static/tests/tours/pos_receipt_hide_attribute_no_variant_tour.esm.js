/* Copyright 2026 INVITU (https://www.invitu.com)
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html). */

/* global posmodel */
import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/tours/utils/dialog_util";
import * as PaymentScreen from "@point_of_sale/../tests/tours/utils/payment_screen_util";
import * as ProductConfigurator from "@point_of_sale/../tests/tours/utils/product_configurator_util";
import * as ProductScreen from "@point_of_sale/../tests/tours/utils/product_screen_util";
import * as ReceiptScreen from "@point_of_sale/../tests/tours/utils/receipt_screen_util";
import {registry} from "@web/core/registry";

function checkKitchenTicket(title, lines) {
    return posmodel
        .getRenderedReceipt(posmodel.get_order(), title, lines)
        .then((ticket) => {
            const text = ticket.textContent;
            if (!text.includes("Rare") || text.includes("Fries")) {
                throw new Error(`Unexpected kitchen ticket content: ${text}`);
            }
        });
}

registry.category("web_tour.tours").add("PosReceiptHideAttributeNoVariantTour", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),
            ProductScreen.clickDisplayedProduct("Hide Steak"),
            ProductConfigurator.pickRadio("Rare"),
            ProductConfigurator.pickRadio("Fries"),
            Dialog.confirm(),

            // The line keeps every value.
            {
                trigger:
                    ".order-container .orderline.selected .product-name:contains('Rare'):contains('Fries')",
            },

            // "Side" is hidden on the kitchen ticket, "Cooking" is not.
            {
                trigger: ".order-container .orderline",
                run: () => {
                    const lines = Object.values(posmodel.getOrderChanges().orderlines);
                    return checkKitchenTicket("New", lines);
                },
            },

            // "Cooking" is hidden on the receipt, "Side" is not.
            ProductScreen.clickPayButton(),
            PaymentScreen.clickPaymentMethod("Cash"),
            PaymentScreen.clickValidate(),
            ReceiptScreen.isShown(),
            {
                trigger: '.pos-receipt .product-name:contains("Hide Steak (Fries)")',
            },
            {
                trigger: '.pos-receipt .product-name:not(:contains("Rare"))',
            },

            Chrome.endTour(),
        ].flat(),
});

registry.category("web_tour.tours").add("PosReceiptHideAttributeNoVariantCancelTour", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),
            ProductScreen.clickDisplayedProduct("Hide Steak"),
            ProductConfigurator.pickRadio("Rare"),
            ProductConfigurator.pickRadio("Fries"),
            Dialog.confirm(),

            // The cancellation ticket hides "Side" like the original one.
            {
                trigger: ".order-container .orderline",
                run: () => {
                    const order = posmodel.get_order();
                    order.updateLastOrderChange();
                    order.removeOrderline(order.get_selected_orderline());
                    const lines = Object.values(
                        posmodel.getOrderChanges().orderlines
                    ).map((line) => ({...line, quantity: Math.abs(line.quantity)}));
                    if (!lines.length) {
                        throw new Error(
                            "The removed line is not reported as cancelled"
                        );
                    }
                    return checkKitchenTicket("Cancelled", lines);
                },
            },

            Chrome.endTour(),
        ].flat(),
});
