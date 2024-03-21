/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale_session.EventEvent", function (require) {
    "use strict";

    const EventEvent = require("pos_event_sale.EventEvent");
    const Registries = require("point_of_sale.Registries");

    const PosEventSaleSessionEvent = (EventEvent) =>
        class extends EventEvent {
        getEventSessions() {
            return this.pos.db.getEventSessionsByEventID(this.id);
        }
        /**
         * @override
         * @param {Order} options.session Limit count to the given EventSession
         * @returns {Number} ordered quantity
         */
        getOrderedQuantity(options) {
            /* eslint-disable no-param-reassign */
            if (this.use_sessions) {
                if (options && options.session) {
                    return options.session.getOrderedQuantity(options);
                }
                return undefined;
            }
            return super.getOrderedQuantity.apply(this, arguments);
        }
        /**
         * @override
         */
        getSeatsAvailable(options) {
            if (this.use_sessions) {
                if (options && options.session) {
                    return options.session.getSeatsAvailable(options);
                }
                return undefined;
            }
            return super.getSeatsAvailable.apply(this, arguments);
        }
        /**
         * @override
         */
        getEventDates() {
            if (this.use_sessions) {
                // TODO: Fix this. It should also consider session.date_end
                const sessionDates = this.getEventSessions().map(
                    (session) => session.date_begin
                );
                return _.unique(
                    sessionDates.map((date) => moment(date).startOf("day").toDate())
                );
            }
            return super.getEventDates.apply(this, arguments);
        }
    }
    Registries.Model.extend(EventEvent, PosEventSaleSessionEvent);
    return EventEvent;
});