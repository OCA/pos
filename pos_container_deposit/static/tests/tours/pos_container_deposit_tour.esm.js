/* Copyright 2024 Hunki Enterprises BV
 * Copyright 2026 Trobz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 */
import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/tours/utils/dialog_util";
import * as Numpad from "@point_of_sale/../tests/tours/utils/numpad_util";
import * as Order from "@point_of_sale/../tests/tours/utils/generic_components/order_widget_util";
import * as ProductScreen from "@point_of_sale/../tests/tours/utils/product_screen_util";
import {inLeftSide} from "@point_of_sale/../tests/tours/utils/common";
import {registry} from "@web/core/registry";

const productName = "Generic sugar liquid";
const depositProductName = "Bottle deposit .25";

registry.category("web_tour.tours").add("pos_container_deposit.test_tour", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),

            // Adding the product also adds its container deposit line, in sync.
            ProductScreen.clickDisplayedProduct(productName),
            inLeftSide([
                ...Order.hasLine({
                    withClass: ".selected",
                    productName,
                    quantity: "1.0",
                }),
                ...Order.hasLine({
                    withoutClass: ".selected",
                    productName: depositProductName,
                    quantity: "1.0",
                }),
            ]),

            // Adding the product again merges the line and keeps the deposit in sync.
            ProductScreen.clickDisplayedProduct(productName),
            inLeftSide([
                ...Order.hasLine({
                    withClass: ".selected",
                    productName,
                    quantity: "2.0",
                }),
                ...Order.hasLine({
                    withoutClass: ".selected",
                    productName: depositProductName,
                    quantity: "2.0",
                }),
            ]),

            // The container deposit line can never be selected directly.
            inLeftSide(Order.clickLine(depositProductName, "2.0")),
            inLeftSide([
                ...Order.hasLine({
                    withClass: ".selected",
                    productName,
                    quantity: "2.0",
                }),
            ]),

            // Backspacing the product line's quantity to zero removes it
            // together with its container deposit line.
            Numpad.click("Qty"),
            Numpad.click("⌫"),
            Numpad.click("⌫"),
            ProductScreen.orderIsEmpty(),

            Chrome.endTour(),
        ].flat(),
});
