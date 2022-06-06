/*
    Copyright 2022 Camptocamp (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.PosModel", function (require) {
    "use strict";

    const models = require("point_of_sale.models");

    const PosModelSuper = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        /**
         * @override
         */
        async _loadMissingProducts(orders) {
            return Promise.all([
                PosModelSuper._loadMissingProducts.apply(this, arguments),
                this._loadMissingEvents(orders),
                this._loadMissingEventTickets(orders),
            ]);
        },
        /**
         * Load missing event data from orders that may be loaded from
         * localStorage or from export_for_ui.
         */
        async _loadMissingEvents(orders) {
            const missingEventIds = [];
            for (const order of orders) {
                for (const line of order.lines) {
                    const eventId = line[2].event_id;
                    if (eventId && !missingEventIds.includes(eventId)) {
                        if (!this.db.getEventByID(eventId, false)) {
                            missingEventIds.push(eventId);
                        }
                    }
                }
            }
            if (!missingEventIds.length) {
                return;
            }
            const eventModel = this.models.find(
                (model) => model.model === "event.event"
            );
            const events = await this.rpc({
                model: eventModel.model,
                method: "read",
                args: [missingEventIds, eventModel.fields],
                context: this.session.user_context,
            });
            eventModel.loaded(this, events);
        },
        /**
         * Load missing event.ticket data from orders that may be loaded from
         * localStorage or from export_for_ui.
         */
        async _loadMissingEventTickets(orders) {
            const missingEventTicketIds = [];
            for (const order of orders) {
                for (const line of order.lines) {
                    const eventTicketId = line[2].event_ticket_id;
                    if (
                        eventTicketId &&
                        !missingEventTicketIds.includes(eventTicketId)
                    ) {
                        if (!this.db.getEventTicketByID(eventTicketId, false)) {
                            missingEventTicketIds.push(eventTicketId);
                        }
                    }
                }
            }
            if (!missingEventTicketIds.length) {
                return;
            }
            const eventTicketModel = this.models.find(
                (model) => model.model === "event.event.ticket"
            );
            const eventTickets = await this.rpc({
                model: eventTicketModel.model,
                method: "read",
                args: [missingEventTicketIds, eventTicketModel.fields],
                context: this.session.user_context,
            });
            eventTicketModel.loaded(this, eventTickets);
        },
    });

    return models;
});
