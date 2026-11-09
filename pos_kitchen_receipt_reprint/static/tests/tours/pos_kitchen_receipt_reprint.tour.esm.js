// Copyright 2026 INVITU (https://www.invitu.com)
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/tours/utils/dialog_util";
import * as PaymentScreen from "@point_of_sale/../tests/tours/utils/payment_screen_util";
import * as ProductScreen from "@point_of_sale/../tests/tours/utils/product_screen_util";
import * as ReceiptScreen from "@point_of_sale/../tests/tours/utils/receipt_screen_util";
import * as TicketScreen from "@point_of_sale/../tests/tours/utils/ticket_screen_util";
import {negateStep} from "@point_of_sale/../tests/tours/utils/common";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("PosKitchenReceiptReprintTour", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),
            ProductScreen.clickDisplayedProduct("Kitchen Dish"),

            // Unpaid order not sent to the kitchen: no reprint.
            ProductScreen.clickControlButtonMore(),
            {trigger: ProductScreen.controlButtonTrigger("Cancel Order")},
            negateStep({trigger: ".o_kitchen_receipt_reprint"}),
            Dialog.cancel(),

            // Outside restaurant mode the kitchen receipt is sent at payment.
            ProductScreen.clickPayButton(),
            PaymentScreen.clickPaymentMethod("Bank"),
            PaymentScreen.clickValidate(),
            Dialog.is({title: "Printing failed"}),
            Dialog.confirm(),
            ReceiptScreen.clickNextOrder(),

            Chrome.clickMenuOption("Orders"),
            TicketScreen.selectFilter("Paid"),
            TicketScreen.selectOrder("-0001"),
            TicketScreen.clickControlButton("Reprint Kitchen"),
            Dialog.bodyIs("Kitchen Printer"),
            Dialog.confirm(),
        ].flat(),
});
