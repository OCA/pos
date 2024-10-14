/*
    Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.tour.TicketSelectorTourMethods", function (require) {
    /* eslint-disable no-empty-function */
    "use strict";

    const {createTourMethods} = require("point_of_sale.tour.utils");

    class Do {
        clickDisplayedTicket(ticketName) {
            return [
                {
                    content: `clicking event.ticket ${ticketName}`,
                    trigger: `.event-tickets-popup .ticket-name:contains("${ticketName}")`,
                },
            ];
        }
        close() {
            return [
                {
                    content: `Close`,
                    trigger: `.event-tickets-popup .button.cancel`,
                },
            ];
        }
    }

    class Check {
        isShown() {
            return [
                {
                    content: "Event tickets is shown",
                    trigger: ".event-tickets-popup:not(:has(.oe_hidden))",
                    run: () => {},
                },
            ];
        }
        ticketIsDisplayed(ticketName) {
            return [
                {
                    content: `'${ticketName}' should be displayed`,
                    trigger: `.event-tickets-popup .ticket-name:contains("${ticketName}")`,
                    run: () => {},
                },
            ];
        }
        ticketHasAvailabilityLabel(ticketName, label) {
            return [
                ...this.ticketIsDisplayed(ticketName),
                {
                    content: `'${ticketName}' should contain label ${label}`,
                    trigger: `.event-tickets-popup .event-ticket:has(.ticket-name:contains("${ticketName}")) .event-availability-tag:contains("${label}")`,
                    run: () => {},
                },
            ];
        }
    }

    return createTourMethods("TicketSelector", Do, Check);
});
