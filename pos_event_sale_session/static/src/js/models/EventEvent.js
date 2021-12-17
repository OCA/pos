/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale_session.EventEvent", function (require) {
    "use strict";

    const models = require("pos_event_sale.EventEvent");
    const EventEventSuper = models.EventEvent.prototype;

    models.EventEvent = models.EventEvent.extend({
        getEventSessions: function () {
            return this.pos.db.getEventSessionsByEventID(this.id);
        },
        /**
         * @override
         * @param {Order} options.session Limit count to the given EventSession
         * @returns {Number} ordered quantity
         */
        getOrderedQuantity: function (options) {
            /* eslint-disable no-param-reassign */
            if (this.use_sessions) {
                if (options && options.session) {
                    return options.session.getOrderedQuantity(options);
                }
                return undefined;
            }
            return EventEventSuper.getOrderedQuantity.apply(this, arguments);
        },
        /**
         * @override
         */
        getSeatsAvailable: function (options) {
            if (this.use_sessions) {
                if (options && options.session) {
                    return options.session.getSeatsAvailable(options);
                }
                return undefined;
            }
            return EventEventSuper.getSeatsAvailable.apply(this, arguments);
        },
        /**
         * @override
         */
        getEventDates: function () {
            if (this.use_sessions) {
                // TODO: Fix this. It should also consider session.date_end
                const sessionDates = this.getEventSessions().map(
                    (session) => session.date_begin
                );
                return _.unique(
                    sessionDates.map((date) => moment(date).startOf("day").toDate())
                );
            }
            return EventEventSuper.getEventDates.apply(this, arguments);
        },
    });

    return models;
});
