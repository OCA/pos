/*
    Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.tour.EventSaleAvailability", function (require) {
    "use strict";

    const {ProductScreen} = require("pos_event_sale.tour.ProductScreenTourMethods");
    const {PaymentScreen} = require("point_of_sale.tour.PaymentScreenTourMethods");
    const {ReceiptScreen} = require("point_of_sale.tour.ReceiptScreenTourMethods");
    const {EventSelector} = require("pos_event_sale.tour.EventSelectorTourMethods");
    const {TicketSelector} = require("pos_event_sale.tour.TicketSelectorTourMethods");
    const {getSteps, startSteps} = require("point_of_sale.tour.utils");
    const Tour = require("web_tour.tour");

    startSteps();

    // Add event through Add Event button
    ProductScreen.do.clickOpenSessionButton();
    ProductScreen.do.clickAddEventButton();
    EventSelector.check.isShown();
    EventSelector.check.eventHasAvailabilityLabel("Les Misérables", "5 remaining");
    EventSelector.do.clickDisplayedEvent("Les Misérables");

    TicketSelector.check.isShown();
    TicketSelector.check.ticketHasAvailabilityLabel("Kids", "3 remaining");
    TicketSelector.check.ticketHasAvailabilityLabel("Standard", "5 remaining");

    // Attempt to add more than the limit
    // While adding Kids tickets, we also get closer to the event limit
    TicketSelector.do.clickDisplayedTicket("Kids");
    TicketSelector.check.ticketHasAvailabilityLabel("Kids", "2 remaining");
    TicketSelector.check.ticketHasAvailabilityLabel("Standard", "4 remaining");
    TicketSelector.do.clickDisplayedTicket("Kids");
    TicketSelector.check.ticketHasAvailabilityLabel("Kids", "1 remaining");
    TicketSelector.check.ticketHasAvailabilityLabel("Standard", "3 remaining");
    TicketSelector.do.clickDisplayedTicket("Kids");
    TicketSelector.check.ticketHasAvailabilityLabel("Kids", "Sold out");
    TicketSelector.check.ticketHasAvailabilityLabel("Standard", "2 remaining");
    ProductScreen.check.selectedOrderlineHas("Les Misérables (Kids)", "3.0", "0.00");

    // Clicking even more won't add orderlines
    TicketSelector.do.clickDisplayedTicket("Kids");
    ProductScreen.check.selectedOrderlineHas("Les Misérables (Kids)", "3.0", "0.00");

    // Consume the rest of Standard tickets
    TicketSelector.do.clickDisplayedTicket("Standard");
    TicketSelector.do.clickDisplayedTicket("Standard");
    ProductScreen.check.selectedOrderlineHas(
        "Les Misérables (Standard)",
        "2.0",
        "30.00"
    );
    TicketSelector.check.ticketHasAvailabilityLabel("Standard", "Sold out");
    TicketSelector.do.close();

    // Finish order
    ProductScreen.do.clickPayButton();
    PaymentScreen.do.clickPaymentMethod("Cash");
    PaymentScreen.do.pressNumpad("3 0");
    PaymentScreen.do.clickValidate();
    ReceiptScreen.do.clickNextOrder();

    // As the event is sold out now, we shouldn't be able to sell more
    ProductScreen.do.clickAddEventButton();
    EventSelector.check.isShown();
    EventSelector.check.eventHasAvailabilityLabel("Les Misérables", "Sold out");
    EventSelector.do.close();

    Tour.register(
        "EventSaleAvailabilityTour",
        {test: true, url: "/pos/ui"},
        getSteps()
    );
});
