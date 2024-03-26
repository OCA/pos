/*
    Copyright 2022 Camptocamp (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale_session.models", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const {PosGlobalState} = require("point_of_sale.models");
    const EventEvent = require("pos_event_sale.EventEvent");
    const EventTicket = require("pos_event_sale.EventTicket");
    const EventSession = require("pos_event_sale_session.EventSession");

    // Extend the Pos global state to load events
    const PosEventSalePosGlobalState = (PosGlobalState) =>
        class extends PosGlobalState {
            async _processData(loadedData) {
                await super._processData(loadedData);
                this._loadEventSession(loadedData["event.session"]);
            }

            _loadEventSession(eventSessions) {
                const modelSessions = eventSessions.map((session) => {
                    session.pos = this;
                    return EventSession.create(session)
                });
                this.db.addEventSessions(modelSessions);
            }

            async _loadMissingProducts(orders) {
                return Promise.all([
                    super._loadMissingProducts.apply(this, arguments),
                    this._loadMissingEventSessions(orders),
                ]);
            }

            /**
             * Load missing event.session data from orders that may be loaded from
             * localStorage or from export_for_ui.
             */
            async _loadMissingEventSessions(orders) {
                const missingEventSessionIds = [];
                for (const order of orders) {
                    for (const line of order.lines) {
                        const eventSessionId = line[2].event_session_id;
                        if (
                            eventSessionId &&
                            !missingEventSessionIds.includes(eventSessionId)
                        ) {
                            if (!this.db.getEventSessionByID(eventSessionId, false)) {
                                missingEventSessionIds.push(eventSessionId);
                            }
                        }
                    }
                }
                if (!missingEventSessionIds.length) {
                    return;
                }
                const eventSessionModel = this.models.find(
                    (model) => model.model === "event.session"
                );
                const eventSessions = await this.rpc({
                    model: eventSessionModel.model,
                    method: "read",
                    args: [missingEventSessionIds, eventSessionModel.fields],
                    context: this.session.user_context,
                });
                eventSessionModel.loaded(this, eventSessions);
            }
        };

    Registries.Model.extend(PosGlobalState, PosEventSalePosGlobalState);

    return PosGlobalState;
});
