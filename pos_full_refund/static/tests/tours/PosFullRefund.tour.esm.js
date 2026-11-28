import * as Chrome from "@point_of_sale/../tests/pos/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/generic_helpers/dialog_util";
import * as FeedbackScreen from "@point_of_sale/../tests/pos/tours/utils/feedback_screen_util";
import * as Order from "@point_of_sale/../tests/generic_helpers/order_widget_util";
import * as PaymentScreen from "@point_of_sale/../tests/pos/tours/utils/payment_screen_util";
import * as ProductScreen from "@point_of_sale/../tests/pos/tours/utils/product_screen_util";
import * as TicketScreen from "@point_of_sale/../tests/pos/tours/utils/ticket_screen_util";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("PosFullRefundTour", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),

            // Create an order with multiple products (using default prices)
            ProductScreen.addOrderline("Desk Pad", "2"),
            ProductScreen.addOrderline("Monitor Stand", "3"),
            ProductScreen.addOrderline("Letter Tray", "1"),

            // Verify the order has the expected lines
            Order.hasLine({productName: "Desk Pad", quantity: "2.00"}),
            Order.hasLine({productName: "Monitor Stand", quantity: "3.00"}),
            Order.hasLine({productName: "Letter Tray", quantity: "1.00"}),

            // Pay for the order
            ProductScreen.clickPayButton(),
            PaymentScreen.clickPaymentMethod("Bank"),
            PaymentScreen.clickValidate(),
            FeedbackScreen.isShown(),
            FeedbackScreen.clickNextOrder(),

            // Go to refund mode
            Chrome.clickOrders(),
            TicketScreen.selectFilter("Active"),
            TicketScreen.selectFilter("Paid"),
            TicketScreen.selectOrder("0001"),
            ProductScreen.clickReview(),

            // Click the "Do Full Refund" button
            {
                trigger: "#set_full_refund_button",
                run: "click",
            },

            // In Odoo 20 onDoRefund navigates directly to PaymentScreen
            PaymentScreen.isShown(),
            PaymentScreen.clickBack(),
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
            FeedbackScreen.isShown(),
        ].flat(),
});
