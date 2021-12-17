/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale_session.EventSelectorPopup", function (require) {
    "use strict";

    const EventSelectorPopup = require("pos_event_sale.EventSelectorPopup");
    const Registries = require("point_of_sale.Registries");
    const {getDatesInRange} = require("pos_event_sale.utils");

    const PosEventSaleSessionEventSelectorPopup = (EventSelectorPopup) =>
        class extends EventSelectorPopup {
            /**
             * @override
             */
            constructor() {
                super(...arguments);
                // Build also a map for event sessions
                this.sessionsByDate = this.getEventSessionsByDate(this.events);
            }
            /**
             * @override
             *
             * Optional update of sessions' available seats. Fails silently if no internet connection.
             * A final availability check is done before paying the order anyways.
             */
            async willStart() {
                const res = await super.willStart(...arguments);
                const session_ids = [];
                for (const event of this.events) {
                    if (event.use_sessions) {
                        session_ids.push(...event.getEventSessions().map((s) => s.id));
                    }
                }
                if (session_ids.length) {
                    try {
                        await this.env.pos.db.updateEventSessionSeatsAvailable({
                            session_ids: session_ids,
                            options: {
                                timeout: 1000,
                                shadow: true,
                            },
                        });
                    } catch (error) {
                        console.debug(error);
                    }
                }
                return res;
            }
            /**
             * @param {Array} events List of events
             * @returns Object mapping event sessions by date string YYYY-MM-DD
             */
            getEventSessionsByDate(events) {
                const res = {};
                for (const event of events) {
                    if (!event.use_sessions) {
                        continue;
                    }
                    for (const session of event.getEventSessions()) {
                        for (const eventDate of session.getEventDates()) {
                            const key = moment(eventDate).format("YYYY-MM-DD");
                            res[key] = res[key] || [];
                            res[key].push(session);
                        }
                    }
                }
                return res;
            }
            get sessionsToDisplay() {
                const dates = getDatesInRange(
                    this.state.selectedStartDate,
                    this.state.selectedEndDate
                );
                const keys = dates.map((date) => moment(date).format("YYYY-MM-DD"));
                const sessions = [];
                for (const key of keys) {
                    if (this.sessionsByDate[key] && this.sessionsByDate[key].length) {
                        sessions.push(...this.sessionsByDate[key]);
                    }
                }
                return _.unique(sessions);
            }
            /**
             * @override
             */
            async clickEvent(ev) {
                const {event, session} = ev.detail;
                if (session) {
                    return await this.showPopup("EventTicketsPopup", {event, session});
                }
                return super.clickEvent(...arguments);
            }
        };

    Registries.Component.extend(
        EventSelectorPopup,
        PosEventSaleSessionEventSelectorPopup
    );
    return EventSelectorPopup;
});
