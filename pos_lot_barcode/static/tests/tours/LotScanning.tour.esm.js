/** @odoo-module */

import * as Chrome from "@point_of_sale/../tests/tours/helpers/ChromeTourMethods";
import * as ErrorPopup from "@point_of_sale/../tests/tours/helpers/ErrorPopupTourMethods";
import * as PaymentScreen from "@point_of_sale/../tests/tours/helpers/PaymentScreenTourMethods";
import * as ProductScreen from "@point_of_sale/../tests/tours/helpers/ProductScreenTourMethods";
import * as ReceiptScreen from "@point_of_sale/../tests/tours/helpers/ReceiptScreenTourMethods";
import {registry} from "@web/core/registry";
import {scan_barcode} from "@point_of_sale/../tests/tours/helpers/utils";

registry.category("web_tour.tours").add("LotScanningTour", {
    test: true,
    url: "/pos/ui",
    steps: () =>
        [
            ProductScreen.confirmOpeningPopup(),

            // Add a product with its Lot
            scan_barcode("10120000515"),
            ProductScreen.selectedOrderlineHas("Lot Product 1"),

            scan_barcode("10120000516"),
            // Error should show because 2 products are found.
            ErrorPopup.clickConfirm(),
            ProductScreen.clickPayButton(),
            PaymentScreen.clickPaymentMethod("Cash"),
            PaymentScreen.clickValidate(),
            ReceiptScreen.trackingMethodIsLot(),
            Chrome.endTour(),
        ].flat(),
});

registry.category("web_tour.tours").add("LotScanningInsteadofInputTour", {
    test: true,
    url: "/pos/ui",
    steps: () =>
        [
            ProductScreen.clickHomeCategory(),
            ProductScreen.clickDisplayedProduct("Lot Product 1"),
            scan_barcode("10120000515"),
            ProductScreen.clickPayButton(),
            PaymentScreen.clickPaymentMethod("Cash"),
            PaymentScreen.clickValidate(),
            ReceiptScreen.trackingMethodIsLot(),
        ].flat(),
});
