/*
    Copyright 2021 Camptocamp (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.db", function (require) {
    "use strict";

    const PosDB = require("point_of_sale.DB");
    const rpc = require("web.rpc");
    const {_t} = require("web.core");

    PosDB.include({
        /**
         * @override
         */
        init: function () {
            this._super.apply(this, arguments);
            this.events = [];
            this.event_by_id = {};
            this.event_ticket_by_id = {};
            this.event_ticket_by_event_id = {};
            this.event_ticket_by_product_id = {};
        },
        /**
         * Adds or updates events loaded in the PoS.
         * This method is called on startup, and when updating the event availability.
         * It keeps the access map up-to-date, and computes some fields.
         *
         * @param {Array} events
         */
        addEvents: function (events) {
            /* eslint-disable no-param-reassign */
            if (!events instanceof Array) {
                events = [events];
            }
            for (const event of events) {
                // Localize dates
                if (event.date_begin) {
                    event.date_begin = moment.utc(event.date_begin).toDate();
                }
                if (event.date_end) {
                    event.date_end = moment.utc(event.date_end).toDate();
                }
                // Sanitize seats_available and seats_max for unlimited events
                // This avoids checking for seats_limited every time.
                if (!event.seats_limited) {
                    event.seats_max = Infinity;
                    event.seats_available = Infinity;
                }
                // Add or update local record
                // Use object.assign to update current Object, if it already exists
                if (this.event_by_id[event.id]) {
                    Object.assign(this.event_by_id[event.id], event);
                } else {
                    this.event_by_id[event.id] = event;
                    this.events.push(event);
                }
            }
        },
        /**
         * Adds or updates event tickets loaded in the PoS.
         * This method is called on startup, and when updating the event availability.
         * It keeps the access map up-to-date, and computes some fields.
         *
         * @param {Array} tickets
         */
        addEventTickets: function (tickets) {
            /* eslint-disable no-param-reassign */
            if (!tickets instanceof Array) {
                tickets = [tickets];
            }
            for (const ticket of tickets) {
                // Sanitize seats_available and seats_max for unlimited tickets
                // This avoids checking for seats_limited every time.
                if (!ticket.seats_limited) {
                    ticket.seats_max = Infinity;
                    ticket.seats_available = Infinity;
                }
                // Add or update local record
                // Use object.assign to update current Object, if it already exists
                if (this.event_ticket_by_id[ticket.id]) {
                    Object.assign(this.event_ticket_by_id[ticket.id], ticket);
                } else {
                    // Map event ticket by id
                    this.event_ticket_by_id[ticket.id] = ticket;
                    // Map event ticket by event id
                    if (!this.event_ticket_by_event_id[ticket.event_id[0]]) {
                        this.event_ticket_by_event_id[ticket.event_id[0]] = [];
                    }
                    this.event_ticket_by_event_id[ticket.event_id[0]].push(ticket);
                    // Map event ticket by product id
                    if (!this.event_ticket_by_product_id[ticket.product_id[0]]) {
                        this.event_ticket_by_product_id[ticket.product_id[0]] = [];
                    }
                    this.event_ticket_by_product_id[ticket.product_id[0]].push(ticket);
                }
            }
        },
        /**
         * @param {Number|Array} event_id
         * @param {Boolean} raiseIfNotFound
         * @returns the event or list of events if you pass a list of ids.
         */
        getEventByID: function (event_id, raiseIfNotFound = true) {
            if (event_id instanceof Array) {
                return event_id.map((id) => this.getEventByID(id)).filter(Boolean);
            }
            const event = this.event_by_id[event_id];
            if (!event && raiseIfNotFound) {
                throw new Error(_.str.sprintf(_t("Event not found: %d"), event_id));
            }
            return event;
        },
        /**
         * @param {Number|Array} ticket_id
         * @param {Boolean} raiseIfNotFound
         * @returns the event ticket or list of event tickets if you pass a list of ids.
         */
        getEventTicketByID: function (ticket_id, raiseIfNotFound = true) {
            if (ticket_id instanceof Array) {
                return ticket_id
                    .map((id) => this.getEventTicketByID(id))
                    .filter(Boolean);
            }
            const ticket = this.event_ticket_by_id[ticket_id];
            if (!ticket && raiseIfNotFound) {
                throw new Error(
                    _.str.sprintf(_t("Event Ticket not found: %d"), ticket_id)
                );
            }
            return ticket;
        },
        getEventTicketsByEventID: function (event_id) {
            return this.event_ticket_by_event_id[event_id] || [];
        },
        getEventsByProductID: function (product_id) {
            const tickets = this.getEventTicketsByProductID(product_id);
            return _.unique(tickets.map((ticket) => ticket.getEvent()));
        },
        getEventTicketsByProductID: function (product_id) {
            return this.event_ticket_by_product_id[product_id] || [];
        },
        /**
         * @returns List of event.event fields to read during availability checks.
         */
        _getUpdateEventSeatsAvailableFieldsEventEvent: function () {
            return ["id", "seats_limited", "seats_available"];
        },
        /**
         * @returns List of event.event.ticket fields to read during availability checks.
         */
        _getUpdateEventSeatsAvailableFieldsEventTicket: function () {
            return ["id", "seats_limited", "seats_available"];
        },
        /**
         * Updates the event seats_available fields from the backend.
         * Updates both event.event and their related event.ticket records.
         *
         * @param {Object} options
         * @param {Array} options.event_ids
         * @param {Object} options.options passed to rpc.query. Optional
         * @returns A promise
         */
        updateEventSeatsAvailable: function ({event_ids = [], options = {}}) {
            // Update event.event seats_available
            const d1 = rpc
                .query(
                    {
                        model: "event.event",
                        method: "search_read",
                        args: [
                            [["id", "in", event_ids]],
                            this._getUpdateEventSeatsAvailableFieldsEventEvent(),
                        ],
                    },
                    options
                )
                .then((events) => this.addEvents(events));
            // Update event.event.ticket seats_available
            const d2 = rpc
                .query(
                    {
                        model: "event.event.ticket",
                        method: "search_read",
                        args: [
                            [["event_id", "in", event_ids]],
                            this._getUpdateEventSeatsAvailableFieldsEventTicket(),
                        ],
                    },
                    options
                )
                .then((tickets) => this.addEventTickets(tickets));
            // Resolve when both finish
            return Promise.all([d1, d2]);
        },
    });

    return PosDB;
});
