/** @odoo-module **/

import {getSteps, startSteps} from "point_of_sale.tour.utils";
import {Chrome} from "point_of_sale.tour.ChromeTourMethods";
import {ErrorPopup} from "point_of_sale.tour.ErrorPopupTourMethods";
import {NumberPopup} from "point_of_sale.tour.NumberPopupTourMethods";
import {PaymentScreen} from "point_of_sale.tour.PaymentScreenTourMethods";
import {ProductScreen} from "point_of_sale.tour.ProductScreenTourMethods";
import {ReceiptScreen} from "point_of_sale.tour.ReceiptScreenTourMethods";
import {TextInputPopup} from "point_of_sale.tour.TextInputPopupTourMethods";
import {TicketScreen} from "point_of_sale.tour.TicketScreenTourMethods";
import Tour from "web_tour.tour";

startSteps();
ProductScreen.do.confirmOpeningPopup();
ProductScreen.do.clickHomeCategory();

// TEST: Order creation with a single gift card voucher paid as payment method. Remaining amount is paid on "Cash".
// steps:
// 1) Create a new order and redirect to payment screen
// 2) Create a new paymentline with "Voucher" name.
// 3) Set a valid voucher's code
// 4) Set a valid voucher's amount
// 5) Pay remaining amount in order to validate the order.
// 6) Finish order

ProductScreen.exec.addOrderline("Letter Tray", "1");
ProductScreen.check.selectedOrderlineHas("Letter Tray", "1.0");
ProductScreen.do.clickPayButton();
PaymentScreen.check.isShown();
PaymentScreen.do.clickPaymentMethod("Voucher");
TextInputPopup.check.isShown();
TextInputPopup.do.inputText("044123456");
TextInputPopup.do.clickConfirm();
NumberPopup.check.isShown();
NumberPopup.do.pressNumpad("1");
NumberPopup.do.clickConfirm();
PaymentScreen.check.selectedPaymentlineHas("Voucher", "1.00");
PaymentScreen.do.clickPaymentMethod("Cash");
PaymentScreen.check.validateButtonIsHighlighted(true);
PaymentScreen.do.clickValidate();
ReceiptScreen.check.totalAmountContains("5.28");
Chrome.do.clickTicketButton();
TicketScreen.do.clickNewTicket();

Tour.register(
    "GiftCardProgramAsRedeemPayment",
    {test: true, url: "/pos/web"},
    getSteps()
);

// TEST: Display error on redeeming an amount greater that allowed by total amount and code points.

startSteps();

ProductScreen.check.isShown();
ProductScreen.do.clickHomeCategory();

ProductScreen.exec.addOrderline("Letter Tray", "1");
ProductScreen.check.selectedOrderlineHas("Letter Tray", "1.0");
ProductScreen.do.clickPayButton();
PaymentScreen.do.clickPaymentMethod("Voucher");
TextInputPopup.check.isShown();
TextInputPopup.do.inputText("044123456");
TextInputPopup.do.clickConfirm();
NumberPopup.check.isShown();
NumberPopup.do.pressNumpad("1");
NumberPopup.do.pressNumpad("0");
NumberPopup.do.pressNumpad("0");
NumberPopup.do.clickConfirm();
ErrorPopup.check.isShown();
ErrorPopup.do.clickConfirm();
Chrome.do.clickTicketButton();
TicketScreen.do.clickNewTicket();

Tour.register(
    "GiftCardProgramAsRedeemPayment2",
    {test: true, url: "/pos/web"},
    getSteps()
);

// TEST: Order creation with multiple gift cards vouchers paid as payment method.
startSteps();

ProductScreen.check.isShown();
ProductScreen.do.clickHomeCategory();

ProductScreen.exec.addOrderline("Letter Tray", "1");
ProductScreen.check.selectedOrderlineHas("Letter Tray", "1.0");
ProductScreen.do.clickPayButton();
PaymentScreen.check.isShown();
PaymentScreen.do.clickPaymentMethod("Voucher");
TextInputPopup.check.isShown();
TextInputPopup.do.inputText("044123456");
TextInputPopup.do.clickConfirm();
NumberPopup.check.isShown();
NumberPopup.do.pressNumpad("1");
NumberPopup.do.clickConfirm();
PaymentScreen.check.selectedPaymentlineHas("Voucher", "1.00");
PaymentScreen.do.clickPaymentMethod("Voucher");
TextInputPopup.check.isShown();
TextInputPopup.do.inputText("044123457");
TextInputPopup.do.clickConfirm();
NumberPopup.check.isShown();
NumberPopup.do.pressNumpad("4 , 2 8");
NumberPopup.do.clickConfirm();
PaymentScreen.check.validateButtonIsHighlighted(true);
PaymentScreen.do.clickValidate();
ReceiptScreen.check.totalAmountContains("5.28");

Tour.register(
    "MultipleGiftCardsAsRedeemPayment",
    {test: true, url: "/pos/web"},
    getSteps()
);
