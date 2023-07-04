/*
    Copyright 2021 Camptocamp (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.Order", function (require) {
    "use strict";

    const core = require("web.core");
    const _t = core._t;
    const Registries = require("point_of_sale.Registries");
    var { Order } = require('point_of_sale.models');


    // Extend the Pos global state to load events
    const PosEventSaleOrder = (Order) =>
        class PosEventSaleOrder extends Order {
            /**
             * @returns {Orderlines} linked to event tickets
             */
            getEventOrderlines() {
                return this.get_orderlines().filter((line) => line.event_ticket_id);
            }

            /**
             * @returns Array of {event.ticket} included in this order
             */
            getEventTickets() {
                return _.unique(
                    this.getEventOrderlines().map((line) => line.getEventTicket())
                );
            }

            /**
             * @returns Array of {event.event} included in this order
             */
            getEvents() {
                return _.unique(
                    this.getEventOrderlines().map((line) => line.getEvent())
                );
            }

            /**
             * @returns {Boolean}
             */
            hasEvents() {
                return this.getEventTickets().length > 0;
            }

            /**
             * Please note it doesn't check the available seats against the backend.
             * For a real availability check see updateAndCheckEventAvailability.
             *
             * @raise {Exception} if the order includes events without enough available seats.
             */
            checkEventAvailability() {
                const lines = this.getEventOrderlines();
                for (const line of lines) {
                    line.checkEventAvailability();
                }
            }

            /**
             * Updates and check the ordered events availability
             * Requires an active internet connection.
             *
             * @returns Promise that resolves if all is ok.
             */
            async updateAndCheckEventAvailability() {
                const tickets = this.getEventTickets();
                const limitedTickets = tickets.filter(
                    (ticket) => ticket.seats_limited || ticket.getEvent().seats_limited
                );
                const limitedEventIds = _.unique(
                    limitedTickets.map((ticket) => ticket.getEvent().id)
                );
                // Nothing to check!
                if (!limitedEventIds.length) {
                    return true;
                }
                // Update event's available seats from backend
                try {
                    await this.pos.db.updateEventSeatsAvailable({
                        event_ids: limitedEventIds,
                    });
                } catch (error) {
                    throw new Error(
                        _t(
                            "Unable to check event tickets availability. Check the internet connection then try again."
                        )
                    );
                }
                // Check ordered event's availability
                this.checkEventAvailability();
            }

            /**
             * @override
             */
            wait_for_push_order() {
                const res = super.wait_for_push_order.apply(this, arguments);
                return Boolean(res || this.hasEvents());
            }

            /**
             * @override
             */
            export_for_printing() {
                const res = super.export_for_printing.apply(this, arguments);
                res.event_registrations = this.event_registrations;
                return res;
            }
        };

    Registries.Model.extend(Order, PosEventSaleOrder);
});
