/** @odoo-module */
/*
    Copyright 2023 Trobz Consulting
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/

import * as Chrome from "@point_of_sale/../tests/tours/helpers/ChromeTourMethods";
import * as ErrorPopup from "@point_of_sale/../tests/tours/helpers/ErrorPopupTourMethods";
import * as PaymentScreen from "@point_of_sale/../tests/tours/helpers/PaymentScreenTourMethods";
import * as ProductScreen from "@point_of_sale/../tests/tours/helpers/ProductScreenTourMethods";
import * as ReceiptScreen from "@point_of_sale/../tests/tours/helpers/ReceiptScreenTourMethods";
import {registry} from "@web/core/registry";
import {selectLotNumber} from "@pos_lot_selection/../tests/tours/LotSelection.tour.esm";

registry.category("web_tour.tours").add("ProductExpiryNotExpired", {
    test: true,
    url: "/pos/ui",
    steps: () =>
        [
            ProductScreen.confirmOpeningPopup(),
            ProductScreen.clickHomeCategory(),
            ProductScreen.clickDisplayedProduct("Lot Product 1"),
            selectLotNumber("10120000515"),
            ProductScreen.selectedOrderlineHas("Lot Product 1"),
            ProductScreen.clickPayButton(),
            PaymentScreen.clickPaymentMethod("Cash"),
            PaymentScreen.clickValidate(),
            ReceiptScreen.trackingMethodIsLot(),
            Chrome.endTour(),
        ].flat(),
});

registry.category("web_tour.tours").add("ProductExpiryExpired", {
    test: true,
    url: "/pos/ui",
    steps: () =>
        [
            ProductScreen.confirmOpeningPopup(),
            ProductScreen.clickHomeCategory(),
            ProductScreen.clickDisplayedProduct("Lot Product 1"),
            selectLotNumber("10120000516"),
            ProductScreen.selectedOrderlineHas("Lot Product 1"),
            ErrorPopup.isShown(),
            ErrorPopup.clickConfirm(),
            ProductScreen.pressNumpad("⌫"),
            ProductScreen.pressNumpad("⌫"),
            // We need to clean the screen
            ProductScreen.orderIsEmpty(),
            Chrome.endTour(),
        ].flat(),
});
