/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_sale_pos_event_sale.SaleOrderManagementScreen", function (require) {
    "use strict";

    const SaleOrderManagementScreen = require("pos_sale.SaleOrderManagementScreen");
    const Registries = require("point_of_sale.Registries");

    const ExtSaleOrderManagementScreen = (SaleOrderManagementScreen) =>
        class extends SaleOrderManagementScreen {
            /**
             * @override to load missing events and tickets
             */
            async _getSaleOrder(id) {
                const order = await super._getSaleOrder(id);
                await this._loadMissingEvents(order);
                await this._loadMissingEventTickets(order);
                return order;
            }
            /**
             * Load missing event.event records from sale order data
             */
            async _loadMissingEvents(order) {
                const missingEventIds = [];
                for (const line of order.order_line) {
                    const eventId = line.event_id && line.event_id[0];
                    if (eventId && !missingEventIds.includes(eventId)) {
                        if (!this.env.pos.db.getEventByID(eventId, false)) {
                            missingEventIds.push(eventId);
                        }
                    }
                }
                if (!missingEventIds.length) {
                    return;
                }
                const eventModel = this.env.pos.models.find(
                    (model) => model.model === "event.event"
                );
                const events = await this.rpc({
                    model: eventModel.model,
                    method: "read",
                    args: [missingEventIds, eventModel.fields],
                    context: this.env.session.user_context,
                });
                eventModel.loaded(this.env.pos, events);
            }
            /**
             * Load missing event.ticket records from sale order data
             */
            async _loadMissingEventTickets(order) {
                const missingEventTicketIds = [];
                for (const line of order.order_line) {
                    const eventTicketId =
                        line.event_ticket_id && line.event_ticket_id[0];
                    if (
                        eventTicketId &&
                        !missingEventTicketIds.includes(eventTicketId)
                    ) {
                        if (!this.env.pos.db.getEventTicketByID(eventTicketId, false)) {
                            missingEventTicketIds.push(eventTicketId);
                        }
                    }
                }
                if (!missingEventTicketIds.length) {
                    return;
                }
                const eventTicketModel = this.env.pos.models.find(
                    (model) => model.model === "event.event.ticket"
                );
                const eventTickets = await this.rpc({
                    model: eventTicketModel.model,
                    method: "read",
                    args: [missingEventTicketIds, eventTicketModel.fields],
                    context: this.env.session.user_context,
                });
                eventTicketModel.loaded(this.env.pos, eventTickets);
            }
        };

    Registries.Component.extend(
        SaleOrderManagementScreen,
        ExtSaleOrderManagementScreen
    );

    return SaleOrderManagementScreen;
});
