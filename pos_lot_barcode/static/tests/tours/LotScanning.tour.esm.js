import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/tours/utils/dialog_util";
import * as PaymentScreen from "@point_of_sale/../tests/tours/utils/payment_screen_util";
import * as ProductScreen from "@point_of_sale/../tests/tours/utils/product_screen_util";
import * as ReceiptScreen from "@point_of_sale/../tests/tours/utils/receipt_screen_util";
import {registry} from "@web/core/registry";
import {scan_barcode} from "@point_of_sale/../tests/tours/utils/common";

registry.category("web_tour.tours").add("LotScanningTour", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),

            // Add a product with its Lot
            scan_barcode("10120000515"),
            ProductScreen.selectedOrderlineHas("Lot Product 1"),

            scan_barcode("10120000516"),
            ProductScreen.clickPayButton(),
            PaymentScreen.clickPaymentMethod("Cash"),
            PaymentScreen.clickValidate(),
            ReceiptScreen.trackingMethodIsLot(),
            Chrome.endTour(),
        ].flat(),
});

registry.category("web_tour.tours").add("LotScanningInsteadofInputTour", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),
            ProductScreen.clickDisplayedProduct("Lot Product 1"),
            scan_barcode("10120000515"),
            ProductScreen.clickPayButton(),
            PaymentScreen.clickPaymentMethod("Cash"),
            PaymentScreen.clickValidate(),
            ReceiptScreen.trackingMethodIsLot(),
        ].flat(),
});
