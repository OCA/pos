/*
    Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.tour.EventSale", function (require) {
    "use strict";

    const {ProductScreen} = require("pos_event_sale.tour.ProductScreenTourMethods");
    const {PaymentScreen} = require("point_of_sale.tour.PaymentScreenTourMethods");
    const {ReceiptScreen} = require("point_of_sale.tour.ReceiptScreenTourMethods");
    const {EventSelector} = require("pos_event_sale.tour.EventSelectorTourMethods");
    const {TicketSelector} = require("pos_event_sale.tour.TicketSelectorTourMethods");
    const {getSteps, startSteps} = require("point_of_sale.tour.utils");
    const Tour = require("web_tour.tour");

    startSteps();

    // Go by default to home category
    ProductScreen.do.confirmOpeningPopup();
    ProductScreen.do.clickHomeCategory();

    // Add event..
    ProductScreen.do.clickDisplayedProduct("Event Registration");
    EventSelector.check.isShown();
    EventSelector.do.clickDisplayedEvent("Les Misérables");

    // Add tickets to Order
    TicketSelector.check.isShown();
    TicketSelector.do.clickDisplayedTicket("Standard");
    ProductScreen.check.selectedOrderlineHas(
        "Les Misérables (Standard)",
        "1.0",
        "15.00"
    );
    TicketSelector.do.clickDisplayedTicket("Standard");
    ProductScreen.check.selectedOrderlineHas(
        "Les Misérables (Standard)",
        "2.0",
        "30.00"
    );
    TicketSelector.do.clickDisplayedTicket("Kids");
    ProductScreen.check.selectedOrderlineHas("Les Misérables (Kids)", "1.0", "0.00");
    TicketSelector.do.close();
    EventSelector.do.close();

    // Payment
    ProductScreen.do.clickPayButton();
    PaymentScreen.check.isShown();
    PaymentScreen.do.clickPaymentMethod("Cash");
    // PaymentScreen.do.pressNumpad("3 0");
    PaymentScreen.check.remainingIs("0.0");
    PaymentScreen.check.validateButtonIsHighlighted(true);
    PaymentScreen.do.clickValidate();
    ReceiptScreen.check.isShown();
    ReceiptScreen.check.totalAmountContains("30.0");
    ReceiptScreen.do.clickNextOrder();
    ProductScreen.check.isShown();

    Tour.register("EventSaleTour", {test: true, url: "/pos/ui"}, getSteps());
});
