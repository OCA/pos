/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale_session.db", function (require) {
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
            this.event_session_by_id = {};
            this.event_session_by_event_id = {};
        },
        /**
         * Adds or updates event sessions loaded in the PoS.
         * This method is called on startup, and when updating the event availability.
         * It keeps the access map up-to-date, and computes some fields.
         *
         * @param {Array} sessions
         */
        addEventSessions: function (sessions) {
            /* eslint-disable no-param-reassign */
            if (!(sessions instanceof Array)) {
                sessions = [sessions];
            }
            for (const session of sessions) {
                // Localize dates
                if (session.date_begin) {
                    session.date_begin = moment.utc(session.date_begin).toDate();
                }
                if (session.date_end) {
                    session.date_end = moment.utc(session.date_end).toDate();
                }
                // This avoids checking for seats_limited every time.
                if (!session.seats_limited) {
                    session.seats_max = Infinity;
                    session.seats_available = Infinity;
                }
                // Add or update local record
                // Use object.assign to update current Object, if it already exists
                if (this.event_session_by_id[session.id]) {
                    Object.assign(this.event_session_by_id[session.id], session);
                } else {
                    this.event_session_by_id[session.id] = session;
                    // Map event session by event id
                    if (!this.event_session_by_event_id[session.event_id[0]]) {
                        this.event_session_by_event_id[session.event_id[0]] = [];
                    }
                    this.event_session_by_event_id[session.event_id[0]].push(session);
                }
            }
        },
        /**
         * @param {Number|Array} session_id
         * @param {Boolean} raiseIfNotFound
         * @returns the session or list of sessions if you pass a list of ids.
         */
        getEventSessionByID: function (session_id, raiseIfNotFound = true) {
            if (session_id instanceof Array) {
                return session_id
                    .map((id) => this.getEventSessionByID(id, raiseIfNotFound))
                    .filter(Boolean);
            }
            const session = this.event_session_by_id[session_id];
            if (!session && raiseIfNotFound) {
                throw new Error(
                    _.str.sprintf(_t("Event Session not found: %d"), session_id)
                );
            }
            return session;
        },
        getEventSessionsByEventID: function (event_id) {
            return this.event_session_by_event_id[event_id] || [];
        },
        /**
         * @returns List of event.session fields to read during availability checks.
         */
        _getUpdateEventSeatsAvailableFieldsEventSession: function () {
            return ["id", "seats_limited", "seats_available"];
        },
        /**
         * Updates EventSession's seats availability from the backend
         *
         * @param {Array} options.session_ids
         * @returns {Promise}
         */
        updateEventSessionSeatsAvailable: function ({session_ids = [], options = {}}) {
            return rpc
                .query(
                    {
                        model: "event.session",
                        method: "search_read",
                        args: [
                            [["id", "in", session_ids]],
                            this._getUpdateEventSeatsAvailableFieldsEventSession(),
                        ],
                    },
                    options
                )
                .then((sessions) => this.addEventSessions(sessions));
        },
    });

    return PosDB;
});
