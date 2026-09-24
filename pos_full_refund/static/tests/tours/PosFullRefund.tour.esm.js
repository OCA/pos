odoo.define("pos_full_refund.tour.PosFullRefundTour", function (require) {
    const {ProductScreen} = require("point_of_sale.tour.ProductScreenTourMethods");
    const {PaymentScreen} = require("point_of_sale.tour.PaymentScreenTourMethods");
    const {ReceiptScreen} = require("point_of_sale.tour.ReceiptScreenTourMethods");
    const {TicketScreen} = require("point_of_sale.tour.TicketScreenTourMethods");
    const {getSteps, startSteps} = require("point_of_sale.tour.utils");
    var Tour = require("web_tour.tour");

    startSteps();

    // Start POS and open session
    ProductScreen.do.confirmOpeningPopup();

    // Create an order with multiple products
    ProductScreen.exec.addOrderline("Desk Pad", "2", "5");
    ProductScreen.exec.addOrderline("Monitor Stand", "3", "4.5");
    ProductScreen.exec.addOrderline("Letter Tray", "1", "5");

    // Verify the order has multiple lines by checking the selected orderline
    ProductScreen.check.selectedOrderlineHas("Letter Tray", "1.0");

    // Pay for the order
    ProductScreen.do.clickPayButton();
    PaymentScreen.do.clickPaymentMethod("Bank");
    PaymentScreen.do.clickValidate();
    ReceiptScreen.check.isShown();
    ReceiptScreen.do.clickNextOrder();

    // Go to refund mode
    ProductScreen.do.clickRefund();

    // Filter should be automatically 'Paid'
    TicketScreen.check.filterIs("Paid");

    // Select the order we just created
    TicketScreen.do.selectOrder("-0001");

    // Click the "Do Full Refund" button
    getSteps().push({
        trigger: "#set_full_refund_button",
        run: "click",
    });

    // Verify we're back on product screen with refund order
    ProductScreen.check.isShown();

    // Verify all lines are in the refund order with negative quantities
    // We can check by selecting each line and verifying the quantity
    ProductScreen.check.selectedOrderlineHas("Letter Tray", "-1.0");
    ProductScreen.do.clickOrderline("Desk Pad", "-2.0");
    ProductScreen.check.selectedOrderlineHas("Desk Pad", "-2.0");
    ProductScreen.do.clickOrderline("Monitor Stand", "-3.0");
    ProductScreen.check.selectedOrderlineHas("Monitor Stand", "-3.0");

    // Complete the refund by paying
    ProductScreen.do.clickPayButton();
    PaymentScreen.do.clickPaymentMethod("Bank");
    PaymentScreen.do.clickValidate();
    ReceiptScreen.check.isShown();

    Tour.register("PosFullRefundTour", {test: true, url: "/pos/ui"}, getSteps());
});
