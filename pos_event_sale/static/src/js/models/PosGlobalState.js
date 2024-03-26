/*
    Copyright 2022 Camptocamp (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.models", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const {PosGlobalState} = require("point_of_sale.models");
    const EventEvent = require("pos_event_sale.EventEvent");
    const EventTicket = require("pos_event_sale.EventTicket");

    // Extend the Pos global state to load events
    const PosEventSalePosGlobalState = (PosGlobalState) =>
        class extends PosGlobalState {
            async _processData(loadedData) {
                await super._processData(loadedData);
                this._loadEventEvent(loadedData["event.event"]);
                this._loadEventTicket(loadedData["event.event.ticket"]);
                this._loadEventTagCategory(loadedData["event.tag.category"]);
                this._loadEventTag(loadedData["event.tag"]);
            }

            _loadEventEvent(events) {
                const modelEvents = events.map((event) => {
                    event.pos = this;
                    return EventEvent.create(event);
                });
                this.db.addEvents(modelEvents);
            }

            _loadEventTicket(tickets) {
                const modelTickets = tickets.map((ticket) => {
                    ticket.pos = this;
                    return EventTicket.create(ticket);
                });
                this.db.addEventTickets(modelTickets);
            }

            _loadEventTagCategory(eventTagCategories) {
                this.db.event_tag_category_by_id = {};
                this.db.event_tags = eventTagCategories;
                for (const eventTagCategory of eventTagCategories) {
                    eventTagCategory.tag_ids = [];
                    this.db.event_tag_category_by_id[eventTagCategory.id] =
                        eventTagCategory;
                }
            }

            _loadEventTag(eventTags) {
                for (const eventTag of eventTags) {
                    const category =
                        this.db.event_tag_category_by_id[eventTag.category_id[0]];
                    if (category) {
                        category.tag_ids.push(eventTag);
                    }
                }
            }

            /**
             * @override
             */
            async _loadMissingProducts(orders) {
                return Promise.all([
                    super._loadMissingProducts.apply(this, arguments),
                    this._loadMissingEvents(orders),
                    this._loadMissingEventTickets(orders),
                ]);
            }

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
            }

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
            }

            /**
             * Prevent race condition on clicking twice the payment screen validate button
             */
            _flush_orders(orders) {
                if (!orders || !orders.length || orders[0] === undefined) {
                    return Promise.resolve([]);
                }
                return super._flush_orders(...arguments);
            }
        };

    Registries.Model.extend(PosGlobalState, PosEventSalePosGlobalState);

    return PosGlobalState;
});
