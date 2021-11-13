/*
Copyright 2021 Camptocamp (https://www.camptocamp.com).
@author Iván Todorovich <ivan.todorovich@camptocamp.com>
License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.EventEvent", function (require) {
    "use strict";

    const models = require("point_of_sale.models");
    const {getDatesInRange} = require("pos_event_sale.utils");

    models.EventEvent = window.Backbone.Model.extend({
        initialize: function (attr, options) {
            _.extend(this, options);
        },
        getEventTickets: function () {
            return this.pos.db.getEventTicketsByEventID(this.id);
        },
        /**
         * Computes the total ordered quantity for this event.
         *
         * @param {Order} options.order defaults to the current order
         * @returns {Number} ordered quantity
         */
        getOrderedQuantity: function ({order} = {}) {
            /* eslint-disable no-param-reassign */
            order = order ? order : this.pos.get_order();
            if (!order) {
                return 0;
            }
            return order
                .get_orderlines()
                .filter((line) => line.getEvent() === this)
                .reduce((sum, line) => sum + line.quantity, 0);
        },
        /**
         * Computes the available places, considering all the ordered quantities in
         * the current order.
         *
         * Please note it doesn't check the available seats against the backend.
         * For a real availability check see updateAndCheckEventAvailability.
         *
         * @param {Object} options - Sent to getOrderedQuantity
         * @returns {Number} available seats
         */
        getSeatsAvailable: function (options) {
            return this.seats_limited
                ? this.seats_available - this.getOrderedQuantity(options)
                : this.seats_available;
        },
        /**
         * Similar to getSeatsAvailable, but also checks its ticket's availability
         *
         * @param {Object} options - Sent to getOrderedQuantity
         * @returns {Number} available seats
         */
        getSeatsAvailableReal: function (options) {
            const ticketSeatsAvailable = this.getEventTickets()
                .map((ticket) => ticket.getSeatsAvailable(options))
                .reduce((sum, qty) => sum + qty, 0);
            const eventSeatsAvailable = this.getSeatsAvailable(options);
            // The available seats is the minimum of both
            return Math.min(ticketSeatsAvailable, eventSeatsAvailable);
        },
        /**
         * @returns {[Date]} List of Dates for which this event is available
         */
        getEventDates: function () {
            return getDatesInRange(this.date_begin, this.date_end);
        },
    });

    return models;
});
