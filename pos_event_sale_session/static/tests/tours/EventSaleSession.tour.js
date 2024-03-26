/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale_session.tour.EventSaleSession", function (require) {
    "use strict";

    const {ProductScreen} = require("pos_event_sale.tour.ProductScreenTourMethods");
    const {PaymentScreen} = require("point_of_sale.tour.PaymentScreenTourMethods");
    const {ReceiptScreen} = require("point_of_sale.tour.ReceiptScreenTourMethods");
    const {
        EventSelector,
    } = require("pos_event_sale_session.tour.EventSelectorTourMethods");
    const {TicketSelector} = require("pos_event_sale.tour.TicketSelectorTourMethods");
    const {getSteps, startSteps} = require("point_of_sale.tour.utils");
    const Tour = require("web_tour.tour");

    startSteps();

    // Add event through Add Event button
    ProductScreen.do.clickAddEventButton();
    EventSelector.check.isShown();

    // Check that both sessions are shown
    EventSelector.check.eventHasAvailabilityLabel("Les Misérables", 1, "5 remaining");
    EventSelector.check.eventHasAvailabilityLabel("Les Misérables", 2, "5 remaining");

    // Click on the first session
    EventSelector.do.clickDisplayedEvent("Les Misérables", 1);
    TicketSelector.check.isShown();
    TicketSelector.check.ticketHasAvailabilityLabel("Kids", "5 remaining");
    TicketSelector.check.ticketHasAvailabilityLabel("Standard", "5 remaining");

    // Add 3 tickets for this session
    TicketSelector.do.clickDisplayedTicket("Kids");
    TicketSelector.do.clickDisplayedTicket("Kids");
    ProductScreen.check.selectedOrderlineHas("Les Misérables (Kids)", "2.0", "0.00");
    TicketSelector.do.clickDisplayedTicket("Standard");
    ProductScreen.check.selectedOrderlineHas(
        "Les Misérables (Standard)",
        "1.0",
        "15.00"
    );
    TicketSelector.check.ticketHasAvailabilityLabel("Kids", "2 remaining");
    TicketSelector.check.ticketHasAvailabilityLabel("Standard", "2 remaining");
    TicketSelector.do.close();

    // Open event selector again
    ProductScreen.do.clickAddEventButton();
    EventSelector.check.isShown();

    // Check that only the first session seats are consumed
    EventSelector.check.eventHasAvailabilityLabel("Les Misérables", 1, "2 remaining");
    EventSelector.check.eventHasAvailabilityLabel("Les Misérables", 2, "5 remaining");

    // Click on the second session
    EventSelector.do.clickDisplayedEvent("Les Misérables", 2);
    TicketSelector.check.isShown();
    TicketSelector.check.ticketHasAvailabilityLabel("Kids", "5 remaining");
    TicketSelector.check.ticketHasAvailabilityLabel("Standard", "5 remaining");

    // Add 2 tickets for this session
    TicketSelector.do.clickDisplayedTicket("Standard");
    TicketSelector.do.clickDisplayedTicket("Standard");
    ProductScreen.check.selectedOrderlineHas(
        "Les Misérables (Standard)",
        "2.0",
        "30.00"
    );
    TicketSelector.check.ticketHasAvailabilityLabel("Kids", "3 remaining");
    TicketSelector.check.ticketHasAvailabilityLabel("Standard", "3 remaining");
    TicketSelector.do.close();

    // Finish order
    ProductScreen.do.clickPayButton();
    PaymentScreen.do.clickPaymentMethod("Cash");
    PaymentScreen.do.pressNumpad("4 5");
    PaymentScreen.check.remainingIs("0.0");
    PaymentScreen.do.clickValidate();
    ReceiptScreen.do.clickNextOrder();

    Tour.register("EventSaleSessionTour", {test: true, url: "/pos/ui"}, getSteps());
});
