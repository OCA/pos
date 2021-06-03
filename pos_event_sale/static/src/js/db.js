/*
Copyright 2021 Camptocamp SA - Iván Todorovich
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_event_sale.db", function(require) {
    "use strict";

    const PosDB = require("point_of_sale.DB");

    PosDB.include({
        /**
         * @override
         */
        init: function() {
            this._super.apply(this, arguments);
            this.events = [];
            this.event_by_id = {};
            this.event_ticket_by_id = {};
            this.event_ticket_by_product_id = {};
        },

        /**
         * Adds or updates events loaded in the PoS.
         * This method is called on startup, and when updating the event availability.
         * It keeps access map up-to-date, and computes some fields.
         */
        add_events: function(events) {
            if (!events instanceof Array) {
                events = [events];
            }
            for (const event of events) {
                // Convert dates to moment()
                if (event.date_begin) {
                    event.date_begin = moment.utc(event.date_begin).toDate();
                }
                if (event.date_end) {
                    event.date_end = moment.utc(event.date_end).toDate();
                }
                // Sanitize seats_available and seats_max for unlimited events
                // This avoids checking for seats_availability every time.
                if (event.seats_availability == "unlimited") {
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
                // Normalize event_ticket_ids to an empty Array, if missing
                const record = this.event_by_id[event.id];
                if (!record.event_ticket_ids) {
                    record.event_ticket_ids = [];
                }
            }
        },

        add_event_tickets: function(tickets) {
            if (!tickets instanceof Array) {
                tickets = [tickets];
            }
            for (const ticket of tickets) {
                // Sanitize seats_available and seats_max for unlimited tickets
                // This avoids checking for seats_availability every time.
                if (ticket.seats_availability == "unlimited") {
                    ticket.seats_max = Infinity;
                    ticket.seats_available = Infinity;
                }
                // Add or update local record
                // Use object.assign to update current Object, if it already exists
                if (this.event_ticket_by_id[ticket.id]) {
                    Object.assign(this.event_ticket_by_id[ticket.id], ticket);
                } else {
                    this.event_ticket_by_id[ticket.id] = ticket;
                    // Map event ticket by product id
                    if (
                        this.event_ticket_by_product_id[ticket.product_id[0]] ===
                        undefined
                    ) {
                        this.event_ticket_by_product_id[ticket.product_id[0]] = [];
                    }
                    this.event_ticket_by_product_id[ticket.product_id[0]].push(ticket);
                    // Enrich event_id and create circular reference
                    const event = this.get_event_by_id(ticket.event_id[0]);
                    if (event) {
                        event.event_ticket_ids.push(ticket);
                        ticket.event_id = event;
                    }
                }
            }
        },

        get_event_by_id: function(id) {
            return this.event_by_id[id];
        },

        get_event_ticket_by_id: function(id) {
            return this.event_ticket_by_id[id];
        },

        get_events_by_product_id: function(product_id) {
            const tickets = this.get_event_tickets_by_product_id(product_id);
            return _.unique(tickets.map(ticket => ticket.event_id));
        },

        get_event_tickets_by_product_id: function(product_id) {
            return this.event_ticket_by_product_id[product_id] || [];
        },
    });

    return PosDB;
});
