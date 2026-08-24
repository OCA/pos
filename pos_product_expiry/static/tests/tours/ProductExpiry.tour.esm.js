/** @odoo-module */
/*
    Copyright 2023 Trobz Consulting
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/

import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/tours/utils/dialog_util";
import * as Numpad from "@point_of_sale/../tests/tours/utils/numpad_util";
import * as PaymentScreen from "@point_of_sale/../tests/tours/utils/payment_screen_util";
import * as ProductScreen from "@point_of_sale/../tests/tours/utils/product_screen_util";
import * as ReceiptScreen from "@point_of_sale/../tests/tours/utils/receipt_screen_util";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("ProductExpiryNotExpired", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),
            ProductScreen.clickDisplayedProduct("Lot Product 1"),
            ProductScreen.enterLotNumber("10120000515"),
            ProductScreen.selectedOrderlineHas("Lot Product 1"),
            ProductScreen.clickPayButton(),
            PaymentScreen.clickPaymentMethod("Cash"),
            PaymentScreen.clickValidate(),
            ReceiptScreen.trackingMethodIsLot(),
            Chrome.endTour(),
        ].flat(),
});

registry.category("web_tour.tours").add("ProductExpiryExpired", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),
            ProductScreen.clickDisplayedProduct("Lot Product 1"),
            ProductScreen.enterLotNumber("10120000516"),
            Dialog.is({title: "Problem with lots"}),
            Dialog.bodyIs(
                "A lot is expired and you are not enabled to sell expired lots. No changes were applied."
            ),
            Dialog.confirm(),
            ProductScreen.selectedOrderlineHas("Lot Product 1"),
            // We need to clean the screen.
            Numpad.click("⌫"),
            Numpad.click("⌫"),
            ProductScreen.orderIsEmpty(),
            Chrome.endTour(),
        ].flat(),
});
