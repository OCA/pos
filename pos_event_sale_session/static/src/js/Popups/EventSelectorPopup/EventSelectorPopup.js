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

    /* eslint-disable no-shadow */
    const PosEventSaleSessionEventSelectorPopup = (EventSelectorPopup) =>
        class extends EventSelectorPopup {
            /**
             * @override
             */
            constructor() {
                super(...arguments);
                // Build also a map for event sessions
                this._sessions = null;
                this._sessionsByDate = null;
            }
            /**
             * @override
             *
             * Optional update of sessions' available seats. Fails silently if no internet connection.
             * A final availability check is done before paying the order anyways.
             */
            async willStart() {
                const res = await super.willStart(...arguments);
                try {
                    await this.env.pos.db.updateEventSessionSeatsAvailable({
                        session_ids: Object.keys(this.env.pos.db.event_session_by_id),
                        options: {
                            timeout: 1000,
                            shadow: true,
                        },
                    });
                } catch (error) {
                    console.debug(error);
                }
                return res;
            }
            /**
             * @property {Array} sessions List of filtered sessions
             */
            get sessions() {
                if (this._sessions !== null) {
                    return this._sessions;
                }
                return this.events
                    .filter((event) => event.use_sessions)
                    .map((event) => event.getEventSessions())
                    .flat();
            }
            /**
             * @property {Array} sessionsByDate Mapping of dates and filtered sessions
             */
            get sessionsByDate() {
                if (this._sessionsByDate !== null) {
                    return this._sessionsByDate;
                }
                this._sessionsByDate = {};
                for (const session of this.sessions) {
                    for (const eventDate of session.getEventDates()) {
                        const key = moment(eventDate).format("YYYY-MM-DD");
                        this._sessionsByDate[key] = this._sessionsByDate[key] || [];
                        this._sessionsByDate[key].push(session);
                    }
                }
                return this._sessionsByDate;
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
            /**
             * @override
             */
            onFiltersChange() {
                this._sessions = null;
                this._sessionsByDate = null;
                return super.onFiltersChange(...arguments);
            }
        };

    Registries.Component.extend(
        EventSelectorPopup,
        PosEventSaleSessionEventSelectorPopup
    );
    return EventSelectorPopup;
});
