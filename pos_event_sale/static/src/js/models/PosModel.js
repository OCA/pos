/*
Copyright 2021 Camptocamp SA - Iván Todorovich
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_event_sale.PosModel", function (require) {
    "use strict";

    const models = require("point_of_sale.models");
    const rpc = require("web.rpc");

    models.PosModel = models.PosModel.extend({
        /**
         * @returns Quantity of event tickets ordered in unsaved paid orders.
         */
        getOrderedEventTickets: function () {
            const orders = [...this.db.get_orders(), this.get_order()];
            return orders.reduce((map, order) => {
                const orderedByTicketID = order.getOrderedEventTickets();
                return Object.keys(orderedByTicketID).reduce((map, ticket_id) => {
                    map[ticket_id] = map[ticket_id] || 0.0;
                    map[ticket_id] += orderedByTicketID[ticket_id];
                    return map;
                }, map);
            }, {});
        },

        /**
         * Computes the available places for a given event, considering all the ordered
         * quantities in the current order and in unsaved paid orders.
         *
         * Please note it doesn't check the available seats against the backend.
         * For a real availability check see updateAndCheckEventAvailability.
         *
         * @param {event.event} event
         * @returns Number of available seats
         */
        getEventSeatsAvailable: function (event) {
            // Ordered quantities
            const orderedByTicketID = this.getOrderedEventTickets();
            const eventOrdered = event.event_ticket_ids.reduce(
                (seats, ticket) => seats + (orderedByTicketID[ticket.id] || 0),
                0
            );
            // Compute ticket available seats
            // This only considers limits configured on the ticket, not on the event.
            const ticketSeatsAvailable = event.event_ticket_ids.reduce(
                (seats, ticket) =>
                    seats +
                    ticket.seats_available -
                    (orderedByTicketID[ticket.id] || 0),
                0
            );
            // This only considers the event limit
            const eventSeatsAvailable = event.seats_available - eventOrdered;
            // The available seats is the minimum of both
            return Math.min(ticketSeatsAvailable, eventSeatsAvailable);
        },

        /**
         * Computes the available places for a given event, considering all the ordered
         * quantities in the current order and in unsaved paid orders.
         *
         * Please note it doesn't check the available seats against the backend.
         * For a real availability check see updateAndCheckEventAvailability.
         *
         * @param {event.ticket} ticket
         * @returns Number of available seats
         */
        getEventTicketSeatsAvailable: function (ticket) {
            const event = ticket.event_id;
            // Ordered quantities
            const orderedByTicketID = this.getOrderedEventTickets();
            const ticketOrdered = orderedByTicketID[ticket.id] || 0;
            const eventOrdered = event.event_ticket_ids.reduce(
                (seats, ticket) => seats + (orderedByTicketID[ticket.id] || 0),
                0
            );
            // Compute availability
            const ticketSeatsAvailable = ticket.seats_available - ticketOrdered;
            const eventSeatsAvailable = event.seats_available - eventOrdered;
            return Math.min(ticketSeatsAvailable, eventSeatsAvailable);
        },

        /**
         * @returns List of event.event fields to read during availability checks.
         */
        _seats_available_update_fields_event_event: function () {
            return ["id", "seats_availability", "seats_available"];
        },

        /**
         * @returns List of event.event.ticket fields to read during availability checks.
         */
        _seats_available_update_fields_event_ticket: function () {
            return ["id", "seats_availability", "seats_available"];
        },

        /**
         * Updates the event seats_available fields from the backend.
         * Updates both event.event and their related event.ticket records.
         *
         * @param {Array} event_ids
         * @param {Object} options passed to rpc.query. Optional
         * @returns A promise
         */
        updateEventSeatsAvailable: function (event_ids, options) {
            // Update event.event seats_available
            const d1 = rpc
                .query(
                    {
                        model: "event.event",
                        method: "search_read",
                        args: [
                            [["id", "in", event_ids]],
                            this._seats_available_update_fields_event_event(),
                        ],
                    },
                    options
                )
                .then((events) => this.db.add_events(events));
            // Update event.event.ticket seats_available
            const d2 = rpc
                .query(
                    {
                        model: "event.event.ticket",
                        method: "search_read",
                        args: [
                            [["event_id", "in", event_ids]],
                            this._seats_available_update_fields_event_ticket(),
                        ],
                    },
                    options
                )
                .then((tickets) => this.db.add_event_tickets(tickets));
            // Resolve when both finish
            return Promise.all([d1, d2]);
        },
    });

    return models;
});
