/*
Copyright 2021 Camptocamp SA - Iván Todorovich
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.TourBasic", function(require) {
    "use strict";

    const Tour = require("web_tour.tour");
    const doSteps = require("pos_event_sale.tour_utils");

    const steps = [
        // Startup
        ...doSteps.startSteps(),
        ...doSteps.clickHomeCategory(),
        // Case : Sell 3 Event Registrations
        ...doSteps.clickProduct("Event Registration"),
        ...doSteps.clickEvent("Test PoS Event"),
        ...doSteps.clickEventTicket("Test PoS Ticket"),
        ...doSteps.clickEventTicket("Test PoS Ticket"),
        ...doSteps.clickEventTicket("Test PoS Ticket"),
        ...doSteps.closePopup(),
        ...doSteps.verifyOrderTotal("45"),
        ...doSteps.finishOrder("Cash", "45"),
    ];

    Tour.register("PosEventTourBasic", {test: true, url: "/pos/web"}, steps);
});
