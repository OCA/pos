/*
Copyright 2021 Camptocamp SA - Iván Todorovich
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_event_sale.Order", function(require) {
    "use strict";

    const models = require("point_of_sale.models");
    const core = require("web.core");
    const _t = core._t;

    models.Order = models.Order.extend({
        /**
         * @returns Quantity of event tickets ordered in this order.
         *          {ticket_id: qty}
         */
        getOrderedEventTickets: function() {
            return this.get_orderlines()
                .filter(line => line.event_ticket_id)
                .reduce((map, line) => {
                    map[line.event_ticket_id] = map[line.event_ticket_id] || 0;
                    map[line.event_ticket_id] += line.quantity;
                    return map;
                }, {});
        },

        /**
         * Updates and check the ordered events availability
         * Requires an active internet connection.
         *
         * @returns Promise that resolves if all is ok.
         */
        updateAndCheckEventAvailability: function() {
            const tickets = _.unique(
                this.pos
                    .get_order()
                    .get_orderlines()
                    .filter(line => line.event_ticket_id)
                    .map(line => line.get_event_ticket())
            );
            const limitedTickets = tickets.filter(
                ticket =>
                    ticket.seats_availability !== "unlimited" ||
                    ticket.event_id.seats_availability !== "unlimited"
            );
            const limitedEventIds = _.unique(
                limitedTickets.map(ticket => ticket.event_id.id)
            );
            // Nothing to check!
            if (!limitedEventIds.length) {
                return Promise.resolve();
            }
            // Update seats_available from backend
            return new Promise((resolve, reject) => {
                this.pos
                    .updateEventSeatsAvailable(limitedEventIds, {
                        shadow: false,
                        timeout: 5000,
                    })
                    .then(() => {
                        for (const ticket of limitedTickets) {
                            if (this.pos.getEventTicketSeatsAvailable(ticket) < 0) {
                                return reject({
                                    error: "unavailable_seats",
                                    ticket: ticket,
                                    title: _t("No available seats"),
                                    message: _.str.sprintf(
                                        _t(
                                            "Not enough available seats for ticket %s (%s)"
                                        ),
                                        ticket.name,
                                        ticket.event_id.display_name
                                    ),
                                });
                            }
                        }
                        return resolve();
                    })
                    .catch(error => {
                        return reject({
                            error: "exception",
                            title: "Exception",
                            message: _t(
                                "Unable to check event tickets availability. Please check your internet connection"
                            ),
                            exception: error,
                        });
                    });
            });
        },
    });

    return models;
});
