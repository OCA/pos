import * as ProductScreen from "@point_of_sale/../tests/tours/utils/product_screen_util";
import * as PaymentScreen from "@point_of_sale/../tests/tours/utils/payment_screen_util";
import * as ReceiptScreen from "@point_of_sale/../tests/tours/utils/receipt_screen_util";
import * as TicketScreen from "@point_of_sale/../tests/tours/utils/ticket_screen_util";
import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/tours/utils/dialog_util";
import * as Order from "@point_of_sale/../tests/tours/utils/generic_components/order_widget_util";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("PosFullRefundTour", {
    steps: () =>
        [
            // Start POS and open session
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),

            // Create an order with multiple products
            ProductScreen.addOrderline("Desk Pad", "2", "5"),
            ProductScreen.addOrderline("Monitor Stand", "3", "4.5"),
            ProductScreen.addOrderline("Letter Tray", "1", "5"),

            // Verify the order has multiple lines
            Order.hasLine({productName: "Desk Pad", quantity: "2.00"}),
            Order.hasLine({productName: "Monitor Stand", quantity: "3.00"}),
            Order.hasLine({productName: "Letter Tray", quantity: "1.00"}),

            // Pay for the order
            ProductScreen.clickPayButton(),
            PaymentScreen.clickPaymentMethod("Bank"),
            PaymentScreen.clickValidate(),
            ReceiptScreen.isShown(),
            ReceiptScreen.clickNextOrder(),

            // Go to refund mode
            ...ProductScreen.clickRefund(),

            // Filter should be automatically 'Paid'
            TicketScreen.filterIs("Paid"),

            // Select the order we just created
            TicketScreen.selectOrder("-0001"),

            // Click the "Do Full Refund" button
            {
                trigger: "#set_full_refund_button",
                run: "click",
            },

            // Verify we're back on product screen with refund order
            {
                ...ProductScreen.back(),
                isActive: ["mobile"],
            },
            ProductScreen.isShown(),

            // Verify all lines are in the refund order with negative quantities
            Order.hasLine({
                productName: "Desk Pad",
                quantity: "-2.00",
            }),
            Order.hasLine({
                productName: "Monitor Stand",
                quantity: "-3.00",
            }),
            Order.hasLine({
                productName: "Letter Tray",
                quantity: "-1.00",
            }),

            // Complete the refund by paying
            ProductScreen.clickPayButton(),
            PaymentScreen.clickPaymentMethod("Bank"),
            PaymentScreen.clickValidate(),
            ReceiptScreen.isShown(),
        ].flat(),
});
