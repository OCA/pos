/*
Copyright 2021 Camptocamp (https://www.camptocamp.com).
@author Iván Todorovich <ivan.todorovich@camptocamp.com>
License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.EventTicket", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const PosModel = require("pos_event_sale.PosModel");

    class EventTicket extends PosModel {
        getEvent() {
            return this.pos.db.getEventByID(this.event_id[0]);
        }

        getProduct() {
            return this.pos.db.get_product_by_id(this.product_id[0]);
        }

        getPriceExtra() {
            return this.price - this.getProduct().lst_price;
        }

        _prepareOrderlineOptions() {
            return {
                price_extra: this.getPriceExtra(),
                extras: {
                    event_ticket_id: this.id,
                },
            };
        }

        /**
         * Computes the total ordered quantity for this event ticket.
         *
         * @param {Object} options
         * @param {Order} options.order defaults to the current order
         * @returns {Number} ordered quantity
         */
        getOrderedQuantity({order} = {}) {
            /* eslint-disable no-param-reassign */
            order = order ? order : this.pos.get_order();
            if (!order) {
                return 0;
            }
            return order
                .get_orderlines()
                .filter((line) => line.getEventTicket() === this)
                .reduce((sum, line) => sum + line.quantity, 0);
        }

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
        getSeatsAvailable(options) {
            return this.seats_limited
                ? this.seats_available - this.getOrderedQuantity(options)
                : this.seats_available;
        }

        /**
         * Similar to getSeatsAvailable, but also checks the event's availability.
         *
         * @param {Object} options - Sent to getOrderedQuantity
         * @returns {Number} available seats
         */
        getSeatsAvailableReal(options) {
            const event = this.getEvent();
            const ticketSeatsAvailable = this.getSeatsAvailable(options);
            const eventSeatsAvailable = event.getSeatsAvailable(options);
            return Math.min(ticketSeatsAvailable, eventSeatsAvailable);
        }
    }

    Registries.Model.add(EventTicket);
    return EventTicket;
});
